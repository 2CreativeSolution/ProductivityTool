import nodemailer from 'nodemailer'

import { db } from 'src/lib/db'
import { getSmtpConfig } from 'src/lib/smtpConfig'

// Helper function to create enhanced email headers for better Outlook compatibility
const createEmailHeaders = (fromEmail) => {
  return {
    'X-Priority': '3',
    'X-MSMail-Priority': 'Normal',
    Importance: 'Normal',
    'X-Mailer': '2Creative Productivity Tool',
    'Reply-To': fromEmail,
    'Return-Path': fromEmail,
    'Content-Type': 'text/html; charset=UTF-8',
    'MIME-Version': '1.0',
  }
}

// Helper function to format dates correctly using UTC
const formatDateForEmail = (dateString) => {
  if (!dateString) return 'N/A'

  // Create date object and use UTC methods to avoid timezone issues
  const date = new Date(dateString)

  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  })
}

// Create reusable transporter using SMTP
const createTransporter = (config) => {
  const { smtpHost, smtpPort, smtpUser, smtpPass } = config

  console.log('📧 Creating email transporter with config:', {
    host: smtpHost,
    port: smtpPort,
    user: smtpUser ? '***configured***' : 'NOT_SET',
    pass: smtpPass ? '***configured***' : 'NOT_SET',
  })

  return nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: false, // true for 465, false for other ports
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
    // Enhanced settings for better Outlook compatibility
    tls: {
      ciphers: 'SSLv3',
      rejectUnauthorized: false,
    },
    debug: true, // Enable debug logs
    logger: true, // Enable logging
  })
}

// Base email template - Enhanced for Outlook compatibility
const createEmailTemplate = (title, content, backgroundColor = '#f3f4f6') => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
      <meta name="x-apple-disable-message-reformatting">
      <title>${title}</title>
      <!--[if mso]>
      <noscript>
        <xml>
          <o:OfficeDocumentSettings>
            <o:AllowPNG/>
            <o:PixelsPerInch>96</o:PixelsPerInch>
          </o:OfficeDocumentSettings>
        </xml>
      </noscript>
      <![endif]-->
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: ${backgroundColor}; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%;">
      <!-- Outlook-compatible wrapper -->
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: ${backgroundColor};">
        <tr>
          <td align="center" style="padding: 20px 0;">
            <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 0; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
              <!-- Header -->
              <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 24px; font-weight: bold; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">2Creative Productivity Tool</h1>
                <p style="color: rgba(255,255,255,0.9); margin: 5px 0 0 0; font-size: 14px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">Request Status Update</p>
              </div>
              
              <!-- Content -->
              <div style="padding: 30px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
                ${content}
              </div>
              
              <!-- Footer -->
              <div style="background-color: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
                <p style="margin: 0; font-size: 12px; color: #6b7280; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
                  This is an automated message from 2Creative Productivity Tool. Please do not reply to this email.
                </p>
                <p style="margin: 5px 0 0 0; font-size: 12px; color: #6b7280; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
                  © 2025 2Creative Solutions. All rights reserved.
                </p>
              </div>
            </div>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `
}

// Supply Request Email Templates
export const sendSupplyRequestApprovalEmail = async (
  user,
  request,
  approverNotes
) => {
  const smtp = getSmtpConfig()
  const transporter = createTransporter(smtp)

  const content = `
    <div style="text-align: center; margin-bottom: 30px;">
      <div style="background-color: #dcfce7; color: #166534; padding: 15px; border-radius: 8px; display: inline-block;">
        <h2 style="margin: 0; font-size: 20px;">✅ Request Approved!</h2>
      </div>
    </div>
    
    <p style="font-size: 16px; color: #374151; line-height: 1.6;">
      Hi <strong>${user.name}</strong>,
    </p>
    
    <p style="font-size: 16px; color: #374151; line-height: 1.6;">
      Great news! Your supply request has been <strong style="color: #059669;">approved</strong>.
    </p>
    
    <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 20px 0;">
      <h3 style="margin: 0 0 15px 0; color: #374151; font-size: 18px;">Request Details:</h3>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; font-weight: bold; color: #6b7280; width: 30%;">Item:</td>
          <td style="padding: 8px 0; color: #374151;">${request.supply.name}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: bold; color: #6b7280;">Quantity:</td>
          <td style="padding: 8px 0; color: #374151;">${request.quantityRequested}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: bold; color: #6b7280;">Category:</td>
          <td style="padding: 8px 0; color: #374151;">${request.supply.category?.name || 'N/A'}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: bold; color: #6b7280;">Request Date:</td>
          <td style="padding: 8px 0; color: #374151;">${formatDateForEmail(request.createdAt)}</td>
        </tr>
      </table>
    </div>
    
    ${
      approverNotes
        ? `
      <div style="background-color: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 20px; margin: 20px 0;">
        <h3 style="margin: 0 0 10px 0; color: #1e40af; font-size: 16px;">Admin Notes:</h3>
        <p style="margin: 0; color: #1e40af; font-style: italic;">"${approverNotes}"</p>
      </div>
    `
        : ''
    }
    
    <p style="font-size: 16px; color: #374151; line-height: 1.6;">
      Your approved items will be made available for pickup. You'll receive further instructions about collection details soon.
    </p>
    
    <p style="font-size: 16px; color: #374151; line-height: 1.6;">
      If you have any questions, please don't hesitate to reach out to the admin team.
    </p>
    
    <p style="font-size: 16px; color: #374151; line-height: 1.6;">
      Best regards,<br>
      <strong>2Creative Admin Team</strong>
    </p>
  `

  const mailOptions = {
    from: `"${smtp.smtpFromName}" <${smtp.smtpFromEmail}>`,
    to: user.email,
    subject: `✅ Supply Request Approved - ${request.supply.name}`,
    html: createEmailTemplate('Supply Request Approved', content, '#dcfce7'),
    headers: createEmailHeaders(smtp.smtpFromEmail),
    // Add text version for better compatibility
    text: `Hi ${user.name},\n\nGreat news! Your supply request has been approved.\n\nRequest Details:\nItem: ${request.supply.name}\nQuantity: ${request.quantityRequested}\nCategory: ${request.supply.category?.name || 'N/A'}\nRequest Date: ${formatDateForEmail(request.createdAt)}\n\n${approverNotes ? `Admin Notes: "${approverNotes}"\n\n` : ''}Your approved items will be made available for pickup. You'll receive further instructions about collection details soon.\n\nIf you have any questions, please don't hesitate to reach out to the admin team.\n\nBest regards,\n2Creative Admin Team`,
  }

  try {
    await transporter.sendMail(mailOptions)
    console.log('Supply request approval email sent to:', user.email)
  } catch (error) {
    console.error('Error sending supply request approval email:', error)
    throw error
  }
}

export const sendSupplyRequestRejectionEmail = async (
  user,
  request,
  rejectionReason
) => {
  const smtp = getSmtpConfig()
  const transporter = createTransporter(smtp)

  const content = `
    <div style="text-align: center; margin-bottom: 30px;">
      <div style="background-color: #fef2f2; color: #dc2626; padding: 15px; border-radius: 8px; display: inline-block;">
        <h2 style="margin: 0; font-size: 20px;">❌ Request Not Approved</h2>
      </div>
    </div>
    
    <p style="font-size: 16px; color: #374151; line-height: 1.6;">
      Hi <strong>${user.name}</strong>,
    </p>
    
    <p style="font-size: 16px; color: #374151; line-height: 1.6;">
      We regret to inform you that your supply request could not be approved at this time.
    </p>
    
    <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 20px 0;">
      <h3 style="margin: 0 0 15px 0; color: #374151; font-size: 18px;">Request Details:</h3>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; font-weight: bold; color: #6b7280; width: 30%;">Item:</td>
          <td style="padding: 8px 0; color: #374151;">${request.supply.name}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: bold; color: #6b7280;">Quantity:</td>
          <td style="padding: 8px 0; color: #374151;">${request.quantityRequested}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: bold; color: #6b7280;">Request Date:</td>
          <td style="padding: 8px 0; color: #374151;">${formatDateForEmail(request.createdAt)}</td>
        </tr>
      </table>
    </div>
    
    <div style="background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 20px; margin: 20px 0;">
      <h3 style="margin: 0 0 10px 0; color: #dc2626; font-size: 16px;">Reason for Rejection:</h3>
      <p style="margin: 0; color: #dc2626; font-weight: 500;">"${rejectionReason}"</p>
    </div>
    
    <p style="font-size: 16px; color: #374151; line-height: 1.6;">
      If you believe this decision was made in error or if you'd like to discuss alternative options, please feel free to contact the admin team or submit a new request with additional justification.
    </p>
    
    <p style="font-size: 16px; color: #374151; line-height: 1.6;">
      Thank you for your understanding.
    </p>
    
    <p style="font-size: 16px; color: #374151; line-height: 1.6;">
      Best regards,<br>
      <strong>2Creative Admin Team</strong>
    </p>
  `

  const mailOptions = {
    from: `"${smtp.smtpFromName}" <${smtp.smtpFromEmail}>`,
    to: user.email,
    subject: `❌ Supply Request Update - ${request.supply.name}`,
    html: createEmailTemplate('Supply Request Status', content, '#fef2f2'),
    headers: createEmailHeaders(smtp.smtpFromEmail),
  }

  try {
    await transporter.sendMail(mailOptions)
    console.log('Supply request rejection email sent to:', user.email)
  } catch (error) {
    console.error('Error sending supply request rejection email:', error)
    throw error
  }
}

// Asset Request Email Templates
export const sendAssetRequestApprovalEmail = async (
  user,
  request,
  asset,
  approverNotes
) => {
  const smtp = getSmtpConfig()
  const transporter = createTransporter(smtp)

  const content = `
    <div style="text-align: center; margin-bottom: 30px;">
      <div style="background-color: #dcfce7; color: #166534; padding: 15px; border-radius: 8px; display: inline-block;">
        <h2 style="margin: 0; font-size: 20px;">✅ Asset Request Approved!</h2>
      </div>
    </div>
    
    <p style="font-size: 16px; color: #374151; line-height: 1.6;">
      Hi <strong>${user.name}</strong>,
    </p>
    
    <p style="font-size: 16px; color: #374151; line-height: 1.6;">
      Excellent news! Your asset request has been <strong style="color: #059669;">approved</strong> and an asset has been assigned to you.
    </p>
    
    <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 20px 0;">
      <h3 style="margin: 0 0 15px 0; color: #374151; font-size: 18px;">Assigned Asset Details:</h3>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; font-weight: bold; color: #6b7280; width: 30%;">Asset ID:</td>
          <td style="padding: 8px 0; color: #374151;">${asset?.assetId || 'N/A'}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: bold; color: #6b7280;">Asset Name:</td>
          <td style="padding: 8px 0; color: #374151;">${asset?.name || 'N/A'}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: bold; color: #6b7280;">Category:</td>
          <td style="padding: 8px 0; color: #374151;">${request.assetCategory?.name || 'N/A'}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: bold; color: #6b7280;">Request Date:</td>
          <td style="padding: 8px 0; color: #374151;">${formatDateForEmail(request.createdAt)}</td>
        </tr>
      </table>
    </div>
    
    ${
      approverNotes
        ? `
      <div style="background-color: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 20px; margin: 20px 0;">
        <h3 style="margin: 0 0 10px 0; color: #1e40af; font-size: 16px;">Admin Notes:</h3>
        <p style="margin: 0; color: #1e40af; font-style: italic;">"${approverNotes}"</p>
      </div>
    `
        : ''
    }
    
    <div style="background-color: #fef3c7; border: 1px solid #fbbf24; border-radius: 8px; padding: 20px; margin: 20px 0;">
      <h3 style="margin: 0 0 10px 0; color: #92400e; font-size: 16px;">📋 Important Reminders:</h3>
      <ul style="margin: 0; padding-left: 20px; color: #92400e;">
        <li style="margin-bottom: 5px;">Please take good care of the assigned asset</li>
        <li style="margin-bottom: 5px;">Report any damage or issues immediately</li>
        <li style="margin-bottom: 5px;">Return the asset by the expected return date</li>
        <li>Contact the admin team if you need an extension</li>
      </ul>
    </div>
    
    <p style="font-size: 16px; color: #374151; line-height: 1.6;">
      Please coordinate with the admin team for asset pickup arrangements.
    </p>
    
    <p style="font-size: 16px; color: #374151; line-height: 1.6;">
      Best regards,<br>
      <strong>2Creative Admin Team</strong>
    </p>
  `

  const mailOptions = {
    from: `"${smtp.smtpFromName}" <${smtp.smtpFromEmail}>`,
    to: user.email,
    subject: `✅ Asset Request Approved - ${asset?.name || request.assetCategory?.name}`,
    html: createEmailTemplate('Asset Request Approved', content, '#dcfce7'),
    headers: createEmailHeaders(smtp.smtpFromEmail),
  }

  try {
    await transporter.sendMail(mailOptions)
    console.log('Asset request approval email sent to:', user.email)
  } catch (error) {
    console.error('Error sending asset request approval email:', error)
    throw error
  }
}

export const sendAssetRequestRejectionEmail = async (
  user,
  request,
  rejectionReason
) => {
  const smtp = getSmtpConfig()
  const transporter = createTransporter(smtp)

  const content = `
    <div style="text-align: center; margin-bottom: 30px;">
      <div style="background-color: #fef2f2; color: #dc2626; padding: 15px; border-radius: 8px; display: inline-block;">
        <h2 style="margin: 0; font-size: 20px;">❌ Asset Request Not Approved</h2>
      </div>
    </div>
    
    <p style="font-size: 16px; color: #374151; line-height: 1.6;">
      Hi <strong>${user.name}</strong>,
    </p>
    
    <p style="font-size: 16px; color: #374151; line-height: 1.6;">
      We regret to inform you that your asset request could not be approved at this time.
    </p>
    
    <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 20px 0;">
      <h3 style="margin: 0 0 15px 0; color: #374151; font-size: 18px;">Request Details:</h3>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; font-weight: bold; color: #6b7280; width: 30%;">Asset Category:</td>
          <td style="padding: 8px 0; color: #374151;">${request.assetCategory?.name || 'N/A'}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: bold; color: #6b7280;">Reason:</td>
          <td style="padding: 8px 0; color: #374151;">${request.reason}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: bold; color: #6b7280;">Request Date:</td>
          <td style="padding: 8px 0; color: #374151;">${formatDateForEmail(request.createdAt)}</td>
        </tr>
      </table>
    </div>
    
    <div style="background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 20px; margin: 20px 0;">
      <h3 style="margin: 0 0 10px 0; color: #dc2626; font-size: 16px;">Reason for Rejection:</h3>
      <p style="margin: 0; color: #dc2626; font-weight: 500;">"${rejectionReason}"</p>
    </div>
    
    <p style="font-size: 16px; color: #374151; line-height: 1.6;">
      If you believe this decision needs to be reconsidered or if you'd like to discuss alternative options, please feel free to contact the admin team or submit a new request with additional justification.
    </p>
    
    <p style="font-size: 16px; color: #374151; line-height: 1.6;">
      Thank you for your understanding.
    </p>
    
    <p style="font-size: 16px; color: #374151; line-height: 1.6;">
      Best regards,<br>
      <strong>2Creative Admin Team</strong>
    </p>
  `

  const mailOptions = {
    from: `"${smtp.smtpFromName}" <${smtp.smtpFromEmail}>`,
    to: user.email,
    subject: `❌ Asset Request Update - ${request.assetCategory?.name}`,
    html: createEmailTemplate('Asset Request Status', content, '#fef2f2'),
    headers: createEmailHeaders(smtp.smtpFromEmail),
  }

  try {
    await transporter.sendMail(mailOptions)
    console.log('Asset request rejection email sent to:', user.email)
  } catch (error) {
    console.error('Error sending asset request rejection email:', error)
    throw error
  }
}

// Vacation Request Email Templates
export const sendVacationRequestApprovalEmail = async (user, request) => {
  const smtp = getSmtpConfig()
  const transporter = createTransporter(smtp)

  const totalDays =
    Math.ceil(
      (new Date(request.endDate) - new Date(request.startDate)) /
        (1000 * 60 * 60 * 24)
    ) + 1

  const content = `
    <div style="text-align: center; margin-bottom: 30px;">
      <div style="background-color: #dcfce7; color: #166534; padding: 15px; border-radius: 8px; display: inline-block;">
        <h2 style="margin: 0; font-size: 20px;">🌴 Vacation Request Approved!</h2>
      </div>
    </div>
    
    <p style="font-size: 16px; color: #374151; line-height: 1.6;">
      Hi <strong>${user.name}</strong>,
    </p>
    
    <p style="font-size: 16px; color: #374151; line-height: 1.6;">
      Great news! Your vacation request has been <strong style="color: #059669;">approved</strong>. Enjoy your time off!
    </p>
    
    <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 20px 0;">
      <h3 style="margin: 0 0 15px 0; color: #374151; font-size: 18px;">Vacation Details:</h3>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; font-weight: bold; color: #6b7280; width: 30%;">Start Date:</td>
          <td style="padding: 8px 0; color: #374151;">${formatDateForEmail(request.startDate)}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: bold; color: #6b7280;">End Date:</td>
          <td style="padding: 8px 0; color: #374151;">${formatDateForEmail(request.endDate)}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: bold; color: #6b7280;">Duration:</td>
          <td style="padding: 8px 0; color: #374151;">${totalDays} day${totalDays > 1 ? 's' : ''}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: bold; color: #6b7280;">Reason:</td>
          <td style="padding: 8px 0; color: #374151;">${request.reason}</td>
        </tr>
      </table>
    </div>
    
    <div style="background-color: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 20px; margin: 20px 0;">
      <h3 style="margin: 0 0 10px 0; color: #1e40af; font-size: 16px;">📝 Before You Go:</h3>
      <ul style="margin: 0; padding-left: 20px; color: #1e40af;">
        <li style="margin-bottom: 5px;">Complete any pending tasks or delegate them appropriately</li>
        <li style="margin-bottom: 5px;">Set up your out-of-office email message</li>
        <li style="margin-bottom: 5px;">Inform your team and clients about your absence</li>
        <li>Update your calendar with your vacation dates</li>
      </ul>
    </div>
    
    <p style="font-size: 16px; color: #374151; line-height: 1.6;">
      We hope you have a wonderful and refreshing time off. If you have any questions before your vacation, please don't hesitate to reach out.
    </p>
    
    <p style="font-size: 16px; color: #374151; line-height: 1.6;">
      Best regards,<br>
      <strong>2Creative Admin Team</strong>
    </p>
  `

  const mailOptions = {
    from: `"${smtp.smtpFromName}" <${smtp.smtpFromEmail}>`,
    to: user.email,
    subject: `🌴 Vacation Request Approved - ${formatDateForEmail(request.startDate)} to ${formatDateForEmail(request.endDate)}`,
    html: createEmailTemplate('Vacation Request Approved', content, '#dcfce7'),
    headers: createEmailHeaders(smtp.smtpFromEmail),
  }

  try {
    await transporter.sendMail(mailOptions)
    console.log('Vacation request approval email sent to:', user.email)
  } catch (error) {
    console.error('Error sending vacation request approval email:', error)
    throw error
  }
}

export const sendVacationRequestRejectionEmail = async (
  user,
  request,
  rejectionReason = 'Request could not be approved at this time'
) => {
  const smtp = getSmtpConfig()
  const transporter = createTransporter(smtp)

  const totalDays =
    Math.ceil(
      (new Date(request.endDate) - new Date(request.startDate)) /
        (1000 * 60 * 60 * 24)
    ) + 1

  const content = `
    <div style="text-align: center; margin-bottom: 30px;">
      <div style="background-color: #fef2f2; color: #dc2626; padding: 15px; border-radius: 8px; display: inline-block;">
        <h2 style="margin: 0; font-size: 20px;">❌ Vacation Request Not Approved</h2>
      </div>
    </div>
    
    <p style="font-size: 16px; color: #374151; line-height: 1.6;">
      Hi <strong>${user.name}</strong>,
    </p>
    
    <p style="font-size: 16px; color: #374151; line-height: 1.6;">
      We regret to inform you that your vacation request could not be approved at this time.
    </p>
    
    <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 20px 0;">
      <h3 style="margin: 0 0 15px 0; color: #374151; font-size: 18px;">Request Details:</h3>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; font-weight: bold; color: #6b7280; width: 30%;">Start Date:</td>
          <td style="padding: 8px 0; color: #374151;">${formatDateForEmail(request.startDate)}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: bold; color: #6b7280;">End Date:</td>
          <td style="padding: 8px 0; color: #374151;">${formatDateForEmail(request.endDate)}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: bold; color: #6b7280;">Duration:</td>
          <td style="padding: 8px 0; color: #374151;">${totalDays} day${totalDays > 1 ? 's' : ''}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: bold; color: #6b7280;">Reason:</td>
          <td style="padding: 8px 0; color: #374151;">${request.reason}</td>
        </tr>
      </table>
    </div>
    
    <div style="background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 20px; margin: 20px 0;">
      <h3 style="margin: 0 0 10px 0; color: #dc2626; font-size: 16px;">Reason for Rejection:</h3>
      <p style="margin: 0; color: #dc2626; font-weight: 500;">"${rejectionReason}"</p>
    </div>
    
    <p style="font-size: 16px; color: #374151; line-height: 1.6;">
      If you'd like to discuss this decision or explore alternative dates, please feel free to reach out to your manager or the admin team. You can also submit a new request for different dates.
    </p>
    
    <p style="font-size: 16px; color: #374151; line-height: 1.6;">
      Thank you for your understanding.
    </p>
    
    <p style="font-size: 16px; color: #374151; line-height: 1.6;">
      Best regards,<br>
      <strong>2Creative Admin Team</strong>
    </p>
  `

  const mailOptions = {
    from: `"${smtp.smtpFromName}" <${smtp.smtpFromEmail}>`,
    to: user.email,
    subject: `❌ Vacation Request Update - ${formatDateForEmail(request.startDate)} to ${formatDateForEmail(request.endDate)}`,
    html: createEmailTemplate('Vacation Request Status', content, '#fef2f2'),
    headers: createEmailHeaders(smtp.smtpFromEmail),
  }

  try {
    await transporter.sendMail(mailOptions)
    console.log('Vacation request rejection email sent to:', user.email)
  } catch (error) {
    console.error('Error sending vacation request rejection email:', error)
    throw error
  }
}

// Admin notification functions for new requests
export const sendSupplyRequestNotificationToAdmins = async (
  user,
  request,
  supply
) => {
  try {
    // Get all admin users
    const adminUsers = await db.user.findMany({
      where: {
        roles: {
          has: 'ADMIN',
        },
      },
    })

    if (adminUsers.length === 0) {
      console.log('⚠️ No admin users found to notify')
      return
    }

    const smtp = getSmtpConfig()
    const transporter = createTransporter(smtp)

    const content = `
      <div style="text-align: center; margin-bottom: 30px;">
        <div style="background-color: #fef3c7; color: #92400e; padding: 15px; border-radius: 8px; display: inline-block;">
          <h2 style="margin: 0; font-size: 20px;">📦 New Supply Request</h2>
        </div>
      </div>
      
      <p style="font-size: 16px; color: #374151; line-height: 1.6;">
        Hello Admin,
      </p>
      
      <p style="font-size: 16px; color: #374151; line-height: 1.6;">
        A new supply request has been submitted and requires your review.
      </p>
      
      <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 20px 0;">
        <h3 style="margin: 0 0 15px 0; color: #374151; font-size: 18px;">Request Details:</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; font-weight: bold; color: #6b7280; width: 30%;">Requested by:</td>
            <td style="padding: 8px 0; color: #374151;">${user.name} (${user.email})</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: bold; color: #6b7280;">Item:</td>
            <td style="padding: 8px 0; color: #374151;">${supply.name}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: bold; color: #6b7280;">Quantity:</td>
            <td style="padding: 8px 0; color: #374151;">${request.quantityRequested}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: bold; color: #6b7280;">Category:</td>
            <td style="padding: 8px 0; color: #374151;">${supply.category?.name || 'N/A'}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: bold; color: #6b7280;">Department:</td>
            <td style="padding: 8px 0; color: #374151;">${user.department || 'N/A'}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: bold; color: #6b7280;">Request Date:</td>
            <td style="padding: 8px 0; color: #374151;">${formatDateForEmail(request.createdAt)}</td>
          </tr>
        </table>
      </div>
      
      ${
        request.reason
          ? `
        <div style="background-color: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <h3 style="margin: 0 0 10px 0; color: #1e40af; font-size: 16px;">Request Reason:</h3>
          <p style="margin: 0; color: #1e40af; font-style: italic;">"${request.reason}"</p>
        </div>
      `
          : ''
      }
      
      <div style="background-color: #fef3c7; border: 1px solid #fbbf24; border-radius: 8px; padding: 20px; margin: 20px 0;">
        <h3 style="margin: 0 0 10px 0; color: #92400e; font-size: 16px;">⏰ Action Required:</h3>
        <p style="margin: 0; color: #92400e;">
          Please log in to the admin panel to review and approve or reject this supply request.
        </p>
      </div>
      
      <p style="font-size: 16px; color: #374151; line-height: 1.6;">
        Best regards,<br>
        <strong>2Creative Productivity Tool</strong>
      </p>
    `

    // Send to all admins
    for (const admin of adminUsers) {
      const mailOptions = {
        from: `"${smtp.smtpFromName}" <${smtp.smtpFromEmail}>`,
        to: admin.email,
        subject: `📦 New Supply Request - ${supply.name} (${user.name})`,
        html: createEmailTemplate(
          'New Supply Request - Admin Notification',
          content,
          '#fef3c7'
        ),
        headers: createEmailHeaders(smtp.smtpFromEmail),
      }

      try {
        await transporter.sendMail(mailOptions)
        console.log('Supply request notification email sent to admin:', admin.email)
      } catch (error) {
        console.error(
          'Error sending supply request notification to admin:',
          admin.email,
          error
        )
      }
    }
  } catch (error) {
    console.error('Error sending supply request admin notifications:', error)
  }
}

export const sendAssetRequestNotificationToAdmins = async (
  user,
  request,
  assetCategory
) => {
  try {
    // Get all admin users
    const adminUsers = await db.user.findMany({
      where: {
        roles: {
          has: 'ADMIN',
        },
      },
    })

    if (adminUsers.length === 0) {
      console.log('⚠️ No admin users found to notify')
      return
    }

    const smtp = getSmtpConfig()
    const transporter = createTransporter(smtp)

    const content = `
      <div style="text-align: center; margin-bottom: 30px;">
        <div style="background-color: #ddd6fe; color: #7c3aed; padding: 15px; border-radius: 8px; display: inline-block;">
          <h2 style="margin: 0; font-size: 20px;">💻 New Asset Request</h2>
        </div>
      </div>
      
      <p style="font-size: 16px; color: #374151; line-height: 1.6;">
        Hello Admin,
      </p>
      
      <p style="font-size: 16px; color: #374151; line-height: 1.6;">
        A new asset request has been submitted and requires your review.
      </p>
      
      <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 20px 0;">
        <h3 style="margin: 0 0 15px 0; color: #374151; font-size: 18px;">Request Details:</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; font-weight: bold; color: #6b7280; width: 30%;">Requested by:</td>
            <td style="padding: 8px 0; color: #374151;">${user.name} (${user.email})</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: bold; color: #6b7280;">Asset Category:</td>
            <td style="padding: 8px 0; color: #374151;">${assetCategory.name}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: bold; color: #6b7280;">Expected Return:</td>
            <td style="padding: 8px 0; color: #374151;">${formatDateForEmail(request.expectedReturnDate)}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: bold; color: #6b7280;">Department:</td>
            <td style="padding: 8px 0; color: #374151;">${user.department || 'N/A'}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: bold; color: #6b7280;">Request Date:</td>
            <td style="padding: 8px 0; color: #374151;">${formatDateForEmail(request.createdAt)}</td>
          </tr>
        </table>
      </div>
      
      <div style="background-color: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 20px; margin: 20px 0;">
        <h3 style="margin: 0 0 10px 0; color: #1e40af; font-size: 16px;">Request Reason:</h3>
        <p style="margin: 0; color: #1e40af; font-style: italic;">"${request.reason}"</p>
      </div>
      
      <div style="background-color: #ddd6fe; border: 1px solid #c4b5fd; border-radius: 8px; padding: 20px; margin: 20px 0;">
        <h3 style="margin: 0 0 10px 0; color: #7c3aed; font-size: 16px;">⏰ Action Required:</h3>
        <p style="margin: 0; color: #7c3aed;">
          Please log in to the admin panel to review and approve or reject this asset request.
        </p>
      </div>
      
      <p style="font-size: 16px; color: #374151; line-height: 1.6;">
        Best regards,<br>
        <strong>2Creative Productivity Tool</strong>
      </p>
    `

    // Send to all admins
    for (const admin of adminUsers) {
      const mailOptions = {
        from: `"${smtp.smtpFromName}" <${smtp.smtpFromEmail}>`,
        to: admin.email,
        subject: `💻 New Asset Request - ${assetCategory.name} (${user.name})`,
        html: createEmailTemplate(
          'New Asset Request - Admin Notification',
          content,
          '#ddd6fe'
        ),
        headers: createEmailHeaders(smtp.smtpFromEmail),
      }

      try {
        await transporter.sendMail(mailOptions)
        console.log(
          'Asset request notification email sent to admin:',
          admin.email
        )
      } catch (error) {
        console.error(
          'Error sending asset request notification to admin:',
          admin.email,
          error
        )
      }
    }
  } catch (error) {
    console.error('Error sending asset request admin notifications:', error)
  }
}

export const sendVacationRequestNotificationToAdmins = async (
  user,
  request
) => {
  try {
    // Get all admin users
    const adminUsers = await db.user.findMany({
      where: {
        roles: {
          has: 'ADMIN',
        },
      },
    })

    if (adminUsers.length === 0) {
      console.log('⚠️ No admin users found to notify')
      return
    }

    const smtp = getSmtpConfig()
    const transporter = createTransporter(smtp)
    const totalDays =
      Math.ceil(
        (new Date(request.endDate) - new Date(request.startDate)) /
          (1000 * 60 * 60 * 24)
      ) + 1

    const content = `
      <div style="text-align: center; margin-bottom: 30px;">
        <div style="background-color: #fce7f3; color: #be185d; padding: 15px; border-radius: 8px; display: inline-block;">
          <h2 style="margin: 0; font-size: 20px;">🌴 New Vacation Request</h2>
        </div>
      </div>
      
      <p style="font-size: 16px; color: #374151; line-height: 1.6;">
        Hello Admin,
      </p>
      
      <p style="font-size: 16px; color: #374151; line-height: 1.6;">
        A new vacation request has been submitted and requires your review.
      </p>
      
      <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 20px 0;">
        <h3 style="margin: 0 0 15px 0; color: #374151; font-size: 18px;">Request Details:</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; font-weight: bold; color: #6b7280; width: 30%;">Requested by:</td>
            <td style="padding: 8px 0; color: #374151;">${user.name} (${user.email})</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: bold; color: #6b7280;">Start Date:</td>
            <td style="padding: 8px 0; color: #374151;">${formatDateForEmail(request.startDate)}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: bold; color: #6b7280;">End Date:</td>
            <td style="padding: 8px 0; color: #374151;">${formatDateForEmail(request.endDate)}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: bold; color: #6b7280;">Duration:</td>
            <td style="padding: 8px 0; color: #374151;">${totalDays} day${totalDays > 1 ? 's' : ''}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: bold; color: #6b7280;">Department:</td>
            <td style="padding: 8px 0; color: #374151;">${user.department || 'N/A'}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: bold; color: #6b7280;">Request Date:</td>
            <td style="padding: 8px 0; color: #374151;">${formatDateForEmail(request.createdAt)}</td>
          </tr>
        </table>
      </div>
      
      <div style="background-color: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 20px; margin: 20px 0;">
        <h3 style="margin: 0 0 10px 0; color: #1e40af; font-size: 16px;">Vacation Reason:</h3>
        <p style="margin: 0; color: #1e40af; font-style: italic;">"${request.reason}"</p>
      </div>
      
      <div style="background-color: #fce7f3; border: 1px solid #f9a8d4; border-radius: 8px; padding: 20px; margin: 20px 0;">
        <h3 style="margin: 0 0 10px 0; color: #be185d; font-size: 16px;">⏰ Action Required:</h3>
        <p style="margin: 0; color: #be185d;">
          Please log in to the admin panel to review and approve or reject this vacation request.
        </p>
      </div>
      
      <p style="font-size: 16px; color: #374151; line-height: 1.6;">
        Best regards,<br>
        <strong>2Creative Productivity Tool</strong>
      </p>
    `

    // Send to all admins
    for (const admin of adminUsers) {
      const mailOptions = {
        from: `"${smtp.smtpFromName}" <${smtp.smtpFromEmail}>`,
        to: admin.email,
        subject: `🌴 New Vacation Request - ${user.name} (${formatDateForEmail(request.startDate)} to ${formatDateForEmail(request.endDate)})`,
        html: createEmailTemplate(
          'New Vacation Request - Admin Notification',
          content,
          '#fce7f3'
        ),
        headers: createEmailHeaders(smtp.smtpFromEmail),
      }

      try {
        await transporter.sendMail(mailOptions)
        console.log(
          'Vacation request notification email sent to admin:',
          admin.email
        )
      } catch (error) {
        console.error(
          'Error sending vacation request notification to admin:',
          admin.email,
          error
        )
      }
    }
  } catch (error) {
    console.error('Error sending vacation request admin notifications:', error)
  }
}

// Enhanced test email function with multi-domain support
export const sendTestEmail = async (recipientEmail) => {
  const smtp = getSmtpConfig()
  try {
    console.log('📧 Attempting to send test email to:', recipientEmail)

    const domain = recipientEmail.split('@')[1]?.toLowerCase()
    console.log('🌐 Detected email domain:', domain)

    const transporter = createTransporter(smtp)

    // Verify connection configuration
    try {
      await transporter.verify()
      console.log('✅ SMTP connection verified successfully')
    } catch (verifyError) {
      console.error('❌ SMTP connection verification failed:', verifyError)
      throw new Error(`SMTP connection failed: ${verifyError.message}`)
    }

    // Domain-specific subject and content customization
    let subjectPrefix = '📧'
    let domainNote = ''

    if (domain?.includes('2cretiv') || domain?.includes('2cretiv')) {
      subjectPrefix = '🏢'
      domainNote = 'This test is for your 2Creative company email system.'
    } else if (domain?.includes('edu') || domain?.includes('ac.')) {
      subjectPrefix = '📚'
      domainNote = 'This test is for your educational institution email system.'
    } else if (domain?.includes('gov') || domain?.includes('mil')) {
      subjectPrefix = '🏛️'
      domainNote = 'This test is for your government/military email system.'
    } else if (
      domain?.includes('outlook') ||
      domain?.includes('hotmail') ||
      domain?.includes('live')
    ) {
      subjectPrefix = '📧'
      domainNote =
        'This test is optimized for Microsoft Outlook/Hotmail email services.'
    } else if (domain?.includes('gmail')) {
      subjectPrefix = '📮'
      domainNote = 'This test is optimized for Google Gmail email services.'
    } else {
      // Check if it's a custom domain
      const commonProviders = [
        'gmail',
        'outlook',
        'yahoo',
        'hotmail',
        'live',
        'aol',
        'protonmail',
        'icloud',
      ]
      const isCustomDomain = !commonProviders.some((provider) =>
        domain?.includes(provider)
      )
      if (isCustomDomain) {
        subjectPrefix = '🌐'
        domainNote = `This test is for your custom business domain: ${domain}`
      }
    }

    const content = `
      <div style="text-align: center; margin-bottom: 30px;">
        <div style="background-color: #dbeafe; color: #1e40af; padding: 15px; border-radius: 8px; display: inline-block;">
          <h2 style="margin: 0; font-size: 20px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">${subjectPrefix} Email Configuration Test</h2>
        </div>
      </div>
      
      <p style="font-size: 16px; color: #374151; line-height: 1.6; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
        Hi there!
      </p>
      
      <p style="font-size: 16px; color: #374151; line-height: 1.6; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
        This is a test email to verify that the email notification system for the 2Creative Productivity Tool is working correctly with your email provider.
      </p>
      
      ${
        domainNote
          ? `
      <div style="background-color: #f3f4f6; border: 1px solid #d1d5db; border-radius: 8px; padding: 15px; margin: 20px 0;">
        <p style="margin: 0; color: #374151; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 14px;">
          <strong>Domain Information:</strong> ${domainNote}
        </p>
      </div>
      `
          : ''
      }
      
      <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 20px; margin: 20px 0;">
        <h3 style="margin: 0 0 10px 0; color: #166534; font-size: 16px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">✅ Email System Status: Working!</h3>
        <p style="margin: 0; color: #166534; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
          If you're reading this in any email client, it means the email notification system has been successfully configured and is compatible with your email provider.
        </p>
      </div>
      
      <div style="background-color: #fef3c7; border: 1px solid #fbbf24; border-radius: 8px; padding: 20px; margin: 20px 0;">
        <h3 style="margin: 0 0 10px 0; color: #92400e; font-size: 16px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">📨 Email Provider Notes:</h3>
        <ul style="margin: 0; padding-left: 20px; color: #92400e; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
          <li>If using <strong>Outlook/Hotmail</strong>: Check spam folder if not received</li>
          <li>If using <strong>Gmail</strong>: Check promotions tab</li>
          <li>If using <strong>Custom/Business Domain</strong>: Check spam folder and contact domain admin if needed</li>
          <li>If using <strong>Educational Domain</strong>: Contact IT support for sender whitelisting if needed</li>
          <li>Add sender to safe/trusted contacts for future emails</li>
        </ul>
      </div>
      
      <p style="font-size: 16px; color: #374151; line-height: 1.6; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
        You can now expect to receive email notifications when:
      </p>
      
      <ul style="font-size: 16px; color: #374151; line-height: 1.6; margin-left: 20px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
        <li>Supply requests are approved or rejected</li>
        <li>Asset requests are approved or rejected</li>
        <li>Vacation requests are approved or rejected</li>
        <li>New requests need admin attention</li>
      </ul>
      
      <p style="font-size: 16px; color: #374151; line-height: 1.6; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
        Best regards,<br>
        <strong>2Creative Admin Team</strong>
      </p>
    `

    const mailOptions = {
      from: `"${smtp.smtpFromName}" <${smtp.smtpFromEmail}>`,
      to: recipientEmail,
      subject: `${subjectPrefix} Email System Test - 2Creative Productivity Tool [Multi-Domain Compatible]`,
      html: createEmailTemplate('Email Configuration Test', content, '#dbeafe'),
      // Enhanced headers for multi-domain compatibility
      headers: createEmailHeaders(smtp.smtpFromEmail),
      // Plain text version for better compatibility
      text: `Hi there!\n\nThis is a test email to verify that the email notification system for the 2Creative Productivity Tool is working correctly with your email provider.\n\n${domainNote ? `Domain Information: ${domainNote}\n\n` : ''}✅ Email System Status: Working!\n\nIf you're reading this in any email client, it means the email notification system has been successfully configured and is compatible with your email provider.\n\n📨 Email Provider Notes:\n- If using Outlook/Hotmail: Check spam folder if not received\n- If using Gmail: Check promotions tab\n- If using Custom/Business Domain: Check spam folder and contact domain admin if needed\n- If using Educational Domain: Contact IT support for sender whitelisting if needed\n- Add sender to safe/trusted contacts for future emails\n\nYou can now expect to receive email notifications when:\n- Supply requests are approved or rejected\n- Asset requests are approved or rejected\n- Vacation requests are approved or rejected\n- New requests need admin attention\n\nBest regards,\n2Creative Admin Team`,
      // Additional settings for better multi-domain deliverability
      priority: 'normal',
      encoding: 'utf8',
    }

    console.log('📧 Sending multi-domain test email with options:', {
      from: mailOptions.from,
      to: mailOptions.to,
      subject: mailOptions.subject,
      hasHtml: !!mailOptions.html,
      hasText: !!mailOptions.text,
      headers: Object.keys(mailOptions.headers),
      domain: domain,
    })

    const info = await transporter.sendMail(mailOptions)
    console.log('✅ Test email sent successfully:', info.messageId)
    console.log('📩 Email details:', {
      messageId: info.messageId,
      accepted: info.accepted,
      rejected: info.rejected,
      response: info.response,
      targetDomain: domain,
    })

    return {
      success: true,
      message: `Multi-domain test email sent successfully to ${recipientEmail}. Message ID: ${info.messageId}. Domain: ${domain}. Check spam folder if using business/educational domains.`,
      messageId: info.messageId,
    }
  } catch (error) {
    console.error('❌ Error sending test email:', error)
    return {
      success: false,
      error: `Failed to send email: ${error.message}`,
    }
  }
}

// Welcome email on successful signup (flag-gated)
export const sendWelcomeEmail = async (user) => {
  if (process.env.WELCOME_EMAIL_ENABLED !== 'true') {
    return
  }

  const smtp = getSmtpConfig({ requireBaseUrl: true })

  const baseUrl = smtp.baseUrl
  const dashboardUrl = `${baseUrl}/`

  const subject = 'Welcome to 2Creative Productivity Tool'
  const displayName = user.name || user.email

  const html = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <style>
          body { margin:0; padding:0; background:#f3f4f6; font-family:'Inter','Segoe UI',system-ui,sans-serif; color:#0f172a; }
          .card { max-width:560px; margin:28px auto; background:#fff; border-radius:14px; overflow:hidden; box-shadow:0 18px 45px rgba(15,23,42,0.12); }
          .header { padding:22px 24px; background:linear-gradient(135deg,#111827 0%,#1f2937 100%); color:#f8fafc; }
          .title { font-size:20px; font-weight:800; letter-spacing:0.01em; }
          .sub { opacity:0.85; font-size:13px; padding-top:4px; }
          .body { padding:26px 28px 10px; }
          .muted { color:#475569; font-size:14px; line-height:1.65; }
          .cta { display:inline-block; margin:18px 0 10px; padding:13px 22px; background:#4f46e5; color:#fff !important; text-decoration:none; border-radius:10px; font-weight:700; letter-spacing:0.01em; }
          .cta:hover { background:#4338ca; }
          .footer { padding:18px 24px 22px; background:#f8fafc; color:#6b7280; font-size:12px; line-height:1.5; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="header">
            <div class="title">Welcome aboard, ${displayName}!</div>
            <div class="sub">Your account is ready.</div>
          </div>
          <div class="body">
            <p class="muted" style="margin-top:0;">Thanks for joining the 2Creative Productivity Tool.</p>
            <p class="muted">You can head straight to your dashboard to start booking rooms, tracking projects, or requesting assets.</p>
            <a class="cta" href="${dashboardUrl}" target="_blank" rel="noopener">Go to Dashboard</a>
            <p class="muted" style="margin-bottom:14px;">If you didn’t create this account, ignore this email.</p>
          </div>
          <div class="footer">
            © 2025 2Creative Solutions — This is an automated message; replies aren’t monitored.
          </div>
        </div>
      </body>
    </html>
  `

  const text = `Welcome aboard, ${displayName}!\n\nYour account is ready. Go to your dashboard: ${dashboardUrl}\n\nIf you didn’t create this account, ignore this email.\n\n— 2Creative Productivity Tool`

  const transporter = createTransporter(smtp)

  await transporter.sendMail({
    from: `"${smtp.smtpFromName}" <${smtp.smtpFromEmail}>`,
    to: user.email,
    subject,
    text,
    html,
  })
}
