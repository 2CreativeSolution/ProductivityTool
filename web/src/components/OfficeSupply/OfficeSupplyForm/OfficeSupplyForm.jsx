import { useState, useEffect } from 'react'

import { gql } from 'graphql-tag'

import {
  Form,
  FormError,
  FieldError,
  Label,
  TextField,
  NumberField,
  SelectField,
  TextAreaField,
  Submit,
} from '@redwoodjs/forms'
import { useMutation, useQuery } from '@redwoodjs/web'
import { toast } from '@redwoodjs/web/toast'

const CREATE_OFFICE_SUPPLY = gql`
  mutation CreateOfficeSupply($input: CreateOfficeSupplyInput!) {
    createOfficeSupply(input: $input) {
      id
      name
      description
      stockCount
      unitPrice
      category {
        id
        name
      }
    }
  }
`

const UPDATE_OFFICE_SUPPLY = gql`
  mutation UpdateOfficeSupply($id: Int!, $input: UpdateOfficeSupplyInput!) {
    updateOfficeSupply(id: $id, input: $input) {
      id
      name
      description
      stockCount
      unitPrice
      category {
        id
        name
      }
    }
  }
`

const GET_CATEGORIES = gql`
  query GetOfficeSupplyCategories {
    officeSupplyCategories {
      id
      name
      description
    }
  }
`

const OfficeSupplyForm = ({ supply, onSave, onCancel, loading }) => {
  const [createSupply] = useMutation(CREATE_OFFICE_SUPPLY, {
    onCompleted: (data) => {
      toast.success('Office supply created successfully!')
      onSave(data.createOfficeSupply)
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  const [updateSupply] = useMutation(UPDATE_OFFICE_SUPPLY, {
    onCompleted: (data) => {
      toast.success('Office supply updated successfully!')
      onSave(data.updateOfficeSupply)
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  const { data: categoriesData, loading: categoriesLoading } =
    useQuery(GET_CATEGORIES)

  const onSubmit = (data) => {
    const input = {
      ...data,
      categoryId: parseInt(data.categoryId),
      stockCount: parseInt(data.stockCount) || 0,
      unitPrice: parseFloat(data.unitPrice) || 0,
    }

    if (supply) {
      updateSupply({ variables: { id: supply.id, input } })
    } else {
      createSupply({ variables: { input } })
    }
  }

  return (
    <div className="mx-auto max-w-2xl rounded-2xl border border-white/20 bg-white/10 p-8 shadow-xl backdrop-blur-lg">
      <div className="mb-8">
        <h2 className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-3xl font-bold text-transparent">
          {supply ? 'Edit Office Supply' : 'Add New Office Supply'}
        </h2>
        <p className="mt-2 text-gray-600">
          {supply
            ? 'Update the office supply information'
            : 'Create a new office supply item'}
        </p>
      </div>

      <Form onSubmit={onSubmit} className="space-y-6">
        <FormError
          error={null}
          wrapperClassName="rw-form-error-wrapper"
          titleClassName="rw-form-error-title"
          listClassName="rw-form-error-list"
        />

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Supply Name */}
          <div className="space-y-2">
            <Label name="name" className="text-sm font-semibold text-gray-700">
              Supply Name *
            </Label>
            <TextField
              name="name"
              defaultValue={supply?.name}
              className="w-full rounded-xl border border-gray-200 bg-white/50 px-4 py-3 backdrop-blur-sm transition-all duration-200 focus:border-transparent focus:ring-2 focus:ring-blue-500"
              placeholder="Enter supply name"
              validation={{ required: true }}
            />
            <FieldError name="name" className="text-sm text-red-500" />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label
              name="categoryId"
              className="text-sm font-semibold text-gray-700"
            >
              Category *
            </Label>
            <SelectField
              name="categoryId"
              defaultValue={supply?.categoryId}
              className="w-full rounded-xl border border-gray-200 bg-white/50 px-4 py-3 backdrop-blur-sm transition-all duration-200 focus:border-transparent focus:ring-2 focus:ring-blue-500"
              validation={{ required: true }}
            >
              <option value="">Select a category</option>
              {categoriesData?.officeSupplyCategories?.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </SelectField>
            <FieldError name="categoryId" className="text-sm text-red-500" />
          </div>

          {/* Current Stock */}
          <div className="space-y-2">
            <Label
              name="stockCount"
              className="text-sm font-semibold text-gray-700"
            >
              Stock Count *
            </Label>
            <NumberField
              name="stockCount"
              defaultValue={supply?.stockCount || 0}
              className="w-full rounded-xl border border-gray-200 bg-white/50 px-4 py-3 backdrop-blur-sm transition-all duration-200 focus:border-transparent focus:ring-2 focus:ring-blue-500"
              placeholder="0"
              validation={{ required: true, min: 0 }}
            />
            <FieldError name="stockCount" className="text-sm text-red-500" />
          </div>

          {/* Unit Price */}
          <div className="space-y-2">
            <Label
              name="unitPrice"
              className="text-sm font-semibold text-gray-700"
            >
              Unit Price
            </Label>
            <NumberField
              name="unitPrice"
              defaultValue={supply?.unitPrice}
              className="w-full rounded-xl border border-gray-200 bg-white/50 px-4 py-3 backdrop-blur-sm transition-all duration-200 focus:border-transparent focus:ring-2 focus:ring-blue-500"
              placeholder="0.00"
              step="0.01"
              validation={{ min: 0 }}
            />
            <FieldError name="unitPrice" className="text-sm text-red-500" />
          </div>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label
            name="description"
            className="text-sm font-semibold text-gray-700"
          >
            Description
          </Label>
          <TextAreaField
            name="description"
            defaultValue={supply?.description}
            className="w-full resize-none rounded-xl border border-gray-200 bg-white/50 px-4 py-3 backdrop-blur-sm transition-all duration-200 focus:border-transparent focus:ring-2 focus:ring-blue-500"
            rows="3"
            placeholder="Enter supply description..."
          />
          <FieldError name="description" className="text-sm text-red-500" />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4 border-t border-gray-200 pt-6">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="rounded-xl bg-gray-100 px-6 py-3 font-semibold text-gray-700 transition-all duration-200 hover:bg-gray-200 hover:shadow-lg"
            >
              Cancel
            </button>
          )}
          <Submit
            disabled={loading || categoriesLoading}
            className="transform rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-3 font-semibold text-white shadow-lg transition-all duration-200 hover:scale-105 hover:from-blue-700 hover:to-purple-700 hover:shadow-xl disabled:transform-none disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? 'Saving...' : supply ? 'Update Supply' : 'Create Supply'}
          </Submit>
        </div>
      </Form>
    </div>
  )
}

export default OfficeSupplyForm
