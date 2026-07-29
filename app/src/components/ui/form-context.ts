import * as React from 'react'
import { useFormContext, useFormState, type FieldPath, type FieldValues } from 'react-hook-form'

export type FormFieldContextValue<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
  name: TName
}

export const FormFieldContext = React.createContext<FormFieldContextValue | null>(null)

export type FormItemContextValue = {
  id: string
}

export const FormItemContext = React.createContext<FormItemContextValue | null>(null)

export function useFormField() {
  const fieldContext = React.useContext(FormFieldContext)
  const itemContext = React.useContext(FormItemContext)

  if (!fieldContext) {
    throw new Error('useFormField should be used within <FormField>')
  }
  if (!itemContext) {
    throw new Error('useFormField should be used within <FormItem>')
  }

  const { getFieldState } = useFormContext()
  const formState = useFormState({ name: fieldContext.name })
  const fieldState = getFieldState(fieldContext.name, formState)

  return {
    id: itemContext.id,
    name: fieldContext.name,
    formItemId: `${itemContext.id}-form-item`,
    formDescriptionId: `${itemContext.id}-form-item-description`,
    formMessageId: `${itemContext.id}-form-item-message`,
    ...fieldState,
  }
}