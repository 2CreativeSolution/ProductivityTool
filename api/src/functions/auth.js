import nodemailer from 'nodemailer'

import { DbAuthHandler } from '@redwoodjs/auth-dbauth-api'

import { cookieName } from 'src/lib/auth'
import { db } from 'src/lib/db'
import { sendWelcomeEmail } from 'src/lib/emailService'

export const handler = async (event, context) => {
  const smtpUser = process.env.SMTP_USERNAME || process.env.SMTP_USER
  const smtpPass = process.env.SMTP_PASS
  const smtpFrom = process.env.SMTP_FROM || process.env.SMTP_USER
  const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com'
  const smtpPort = Number(process.env.SMTP_PORT) || 587
  const resetBaseUrl = (process.env.WEB_APP_URL || 'http://localhost:8910').replace(/\/$/, '')

  if (process.env.NODE_ENV === 'production' && !process.env.WEB_APP_URL) {
    throw new Error('WEB_APP_URL is required in production for password reset links')
  }

  const forgotPasswordOptions = {
    // handler() is invoked after verifying that a user was found with the given
    // username. This is where you can send the user an email with a link to
    // reset their password. With the default dbAuth routes and field names, the
    // URL to reset the password will be:
    //
    // https://example.com/reset-password?resetToken=${user.resetToken}
    //
    // Whatever is returned from this function will be returned from
    // the `forgotPassword()` function that is destructured from `useAuth()`.
    // You could use this return value to, for example, show the email
    // address in a toast message so the user will know it worked and where
    // to look for the email.
    //
    // Note that this return value is sent to the client in *plain text*
    // so don't include anything you wouldn't want prying eyes to see. The
    // `user` here has been sanitized to only include the fields listed in
    // `allowedUserFields` so it should be safe to return as-is.
    handler: async (user, resetToken) => {
      // Use environment variables for credentials!
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: false,
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      })

      const resetUrl = `${resetBaseUrl}/reset-password?resetToken=${resetToken}`

      const subject = 'Reset your password - 2Creative Productivity Tool'

      const html = `
        <!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <style>
              body { margin:0; padding:0; background:#f3f4f6; font-family: 'Inter', 'Segoe UI', system-ui, sans-serif; color:#0f172a; }
              .card { max-width: 560px; margin: 28px auto; background:#ffffff; border-radius:14px; overflow:hidden; box-shadow:0 18px 45px rgba(15,23,42,0.12); }
              .header { padding:22px 24px; background:linear-gradient(135deg,#312e81 0%,#5b21b6 50%, #7c3aed 100%); color:#f8fafc; }
              .name { font-size:18px; font-weight:700; letter-spacing:0.01em; }
              .sub { opacity:0.82; font-size:13px; padding-top:4px; }
              .body { padding:26px 28px 10px; }
              .muted { color:#475569; font-size:14px; line-height:1.65; }
              .cta { display:inline-block; margin:18px 0 10px; padding:13px 22px; background:#111827; color:#ffffff !important; text-decoration:none; border-radius:10px; font-weight:700; letter-spacing:0.01em; }
              .cta:hover { background:#0b1220; }
              .link { color:#4338ca; word-break:break-all; font-size:13px; }
              .footer { padding:18px 24px 22px; background:#f8fafc; color:#6b7280; font-size:12px; line-height:1.5; }
            </style>
          </head>
          <body>
            <div class="card">
              <div class="header">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
                  <tr>
                    <td class="name">2Creative Productivity Tool</td>
                  </tr>
                  <tr>
                    <td class="sub">Password reset request</td>
                  </tr>
                </table>
              </div>
              <div class="body">
                <p class="muted" style="margin-top:0;">We received a request to reset the password for your account.</p>
                <a class="cta" href="${resetUrl}" target="_blank" rel="noopener">Reset your password</a>
                <p class="muted">If the button doesn’t work, copy and paste this link into your browser:</p>
                <p class="link">${resetUrl}</p>
                <p class="muted" style="margin-bottom:14px;">This link expires in 24 hours. If you didn’t request this, you can safely ignore this email.</p>
              </div>
              <div class="footer">
                © 2025 2Creative Solutions — This is an automated message; replies aren’t monitored.
              </div>
            </div>
          </body>
        </html>
      `

      const text = `We received a request to reset your password.\n\nReset link: ${resetUrl}\n\nThis link expires in 24 hours. If you did not request this, you can ignore this email.`

      await transporter.sendMail({
        from: `"2Creative Productivity Tool" <${smtpFrom}>`,
        to: user.email,
        subject,
        text,
        html,
      })

      // Optionally return the email for frontend toast
      return { email: user.email }
    },

    // How long the resetToken is valid for, in seconds (default is 24 hours)
    expires: 60 * 60 * 24,

    errors: {
      // for security reasons you may want to be vague here rather than expose
      // the fact that the email address wasn't found (prevents fishing for
      // valid email addresses)
      usernameNotFound: 'Username not found',
      // if the user somehow gets around client validation
      usernameRequired: 'Username is required',
    },
  }

  const loginOptions = {
    // handler() is called after finding the user that matches the
    // username/password provided at login, but before actually considering them
    // logged in. The `user` argument will be the user in the database that
    // matched the username/password.
    //
    // If you want to allow this user to log in simply return the user.
    //
    // If you want to prevent someone logging in for another reason (maybe they
    // didn't validate their email yet), throw an error and it will be returned
    // by the `logIn()` function from `useAuth()` in the form of:
    // `{ message: 'Error message' }`
    handler: (user) => {
      return user
    },

    errors: {
      usernameOrPasswordMissing: 'Both username and password are required',
      usernameNotFound: 'Username ${username} not found',
      // For security reasons you may want to make this the same as the
      // usernameNotFound error so that a malicious user can't use the error
      // to narrow down if it's the username or password that's incorrect
      incorrectPassword: 'Incorrect password for ${username}',
    },

    // How long a user will remain logged in, in seconds
    expires: 60 * 60 * 24 * 365 * 10,
  }

  const resetPasswordOptions = {
    // handler() is invoked after the password has been successfully updated in
    // the database. Returning anything truthy will automatically log the user
    // in. Return `false` otherwise, and in the Reset Password page redirect the
    // user to the login page.
    handler: (_user) => {
      return true
    },

    // If `false` then the new password MUST be different from the current one
    allowReusedPassword: true,

    errors: {
      // the resetToken is valid, but expired
      resetTokenExpired: 'resetToken is expired',
      // no user was found with the given resetToken
      resetTokenInvalid: 'resetToken is invalid',
      // the resetToken was not present in the URL
      resetTokenRequired: 'resetToken is required',
      // new password is the same as the old password (apparently they did not forget it)
      reusedPassword: 'Must choose a new password',
    },
  }

  const signupOptions = {
    // Whatever you want to happen to your data on new user signup. Redwood will
    // check for duplicate usernames before calling this handler. At a minimum
    // you need to save the `username`, `hashedPassword` and `salt` to your
    // user table. `userAttributes` contains any additional object members that
    // were included in the object given to the `signUp()` function you got
    // from `useAuth()`.
    //
    // If you want the user to be immediately logged in, return the user that
    // was created.
    //
    // If this handler throws an error, it will be returned by the `signUp()`
    // function in the form of: `{ error: 'Error message' }`.
    //
    // If this returns anything else, it will be returned by the
    // `signUp()` function in the form of: `{ message: 'String here' }`.
    handler: async ({ username, hashedPassword, salt, userAttributes }) => {
      const user = await db.user.create({
        data: {
          email: username,
          hashedPassword: hashedPassword,
          salt: salt,
          name: userAttributes?.name,
        },
      })

      // Non-blocking welcome email if enabled
      sendWelcomeEmail(user).catch((err) => {
        console.warn('Welcome email skipped/failed:', err?.message || err)
      })

      return user
    },

    // Include any format checks for password here. Return `true` if the
    // password is valid, otherwise throw a `PasswordValidationError`.
    // Import the error along with `DbAuthHandler` from `@redwoodjs/api` above.
    passwordValidation: (_password) => {
      return true
    },

    errors: {
      // `field` will be either "username" or "password"
      fieldMissing: '${field} is required',
      usernameTaken: 'Username `${username}` already in use',
    },
  }

  const authHandler = new DbAuthHandler(event, context, {
    // Provide prisma db client
    db: db,

    // The name of the property you'd call on `db` to access your user table.
    // i.e. if your Prisma model is named `User` this value would be `user`, as in `db.user`
    authModelAccessor: 'user',

    // A map of what dbAuth calls a field to what your database calls it.
    // `id` is whatever column you use to uniquely identify a user (probably
    // something like `id` or `userId` or even `email`)
    authFields: {
      id: 'id',
      username: 'email',
      hashedPassword: 'hashedPassword',
      salt: 'salt',
      resetToken: 'resetToken',
      resetTokenExpiresAt: 'resetTokenExpiresAt',
    },

    // A list of fields on your user object that are safe to return to the
    // client when invoking a handler that returns a user (like forgotPassword
    // and signup). This list should be as small as possible to be sure not to
    // leak any sensitive information to the client.
    allowedUserFields: ['id', 'email'],

    // Specifies attributes on the cookie that dbAuth sets in order to remember
    // who is logged in. See https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies#restrict_access_to_cookies
    cookie: {
      attributes: {
        HttpOnly: true,
        Path: '/',
        SameSite: 'Lax',
        Secure: process.env.NODE_ENV !== 'development',

        // If you need to allow other domains (besides the api side) access to
        // the dbAuth session cookie:
        // Domain: 'example.com',
      },
      name: cookieName,
    },

    forgotPassword: forgotPasswordOptions,
    login: loginOptions,
    resetPassword: resetPasswordOptions,
    signup: signupOptions,
  })

  return await authHandler.invoke()
}
