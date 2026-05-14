import { useState } from 'react'
import { Input } from '@/components/ui/Input'
import { AlertCircle } from 'lucide-react'
import type { CardDetails } from '@/types'

interface CardDetailsFormProps {
  onCardDetailsChange: (cardDetails: CardDetails) => void
}

export function CardDetailsForm({ onCardDetailsChange }: CardDetailsFormProps) {
  const [cardDetails, setCardDetails] = useState<CardDetails>({
    cardholderName: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
  })
  const [errors, setErrors] = useState<Partial<CardDetails>>({})

  const validateCardNumber = (cardNumber: string): boolean => {
    const cleaned = cardNumber.replace(/\s/g, '')
    return cleaned.length >= 13 && cleaned.length <= 19 && /^\d+$/.test(cleaned)
  }

  const validateExpiryDate = (expiryDate: string): boolean => {
    return /^\d{2}\/\d{2}$/.test(expiryDate)
  }

  const validateCVV = (cvv: string): boolean => {
    return /^\d{3,4}$/.test(cvv)
  }

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\s/g, '')
    // Format card number with spaces every 4 digits
    const formatted = value.replace(/(\d{4})/g, '$1 ').trim()
    const newDetails = { ...cardDetails, cardNumber: formatted }
    setCardDetails(newDetails)

    // Validate
    const newErrors = { ...errors }
    if (formatted.trim() && !validateCardNumber(formatted)) {
      newErrors.cardNumber = 'Card number must be 13-19 digits'
    } else {
      delete newErrors.cardNumber
    }
    setErrors(newErrors)
    onCardDetailsChange(newDetails)
  }

  const handleExpiryDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '')
    if (value.length >= 2) {
      value = value.slice(0, 2) + '/' + value.slice(2, 4)
    }
    const newDetails = { ...cardDetails, expiryDate: value }
    setCardDetails(newDetails)

    // Validate
    const newErrors = { ...errors }
    if (value && !validateExpiryDate(value)) {
      newErrors.expiryDate = 'Use MM/YY format'
    } else {
      delete newErrors.expiryDate
    }
    setErrors(newErrors)
    onCardDetailsChange(newDetails)
  }

  const handleCVVChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 4)
    const newDetails = { ...cardDetails, cvv: value }
    setCardDetails(newDetails)

    // Validate
    const newErrors = { ...errors }
    if (value && !validateCVV(value)) {
      newErrors.cvv = 'CVV must be 3-4 digits'
    } else {
      delete newErrors.cvv
    }
    setErrors(newErrors)
    onCardDetailsChange(newDetails)
  }

  const handleCardholderNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    const newDetails = { ...cardDetails, cardholderName: value }
    setCardDetails(newDetails)

    // Validate
    const newErrors = { ...errors }
    if (value && value.trim().length < 2) {
      newErrors.cardholderName = 'Cardholder name is required'
    } else {
      delete newErrors.cardholderName
    }
    setErrors(newErrors)
    onCardDetailsChange(newDetails)
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium bg-primary-600 text-white">
          2
        </div>
        <h2 className="font-semibold text-gray-900 dark:text-gray-100">Card Details</h2>
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4 flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-blue-800 dark:text-blue-300">
          This is a dummy payment gateway for testing. You can use any valid card number (13-19 digits) with expiry in MM/YY format and a 3-4 digit CVV.
        </p>
      </div>

      <div className="space-y-4">
        <Input
          label="Cardholder Name"
          placeholder="John Doe"
          value={cardDetails.cardholderName}
          onChange={handleCardholderNameChange}
          error={errors.cardholderName}
        />

        <Input
          label="Card Number"
          placeholder="4532 1234 5678 9010"
          value={cardDetails.cardNumber}
          onChange={handleCardNumberChange}
          error={errors.cardNumber}
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Expiry Date"
            placeholder="MM/YY"
            value={cardDetails.expiryDate}
            onChange={handleExpiryDateChange}
            error={errors.expiryDate}
          />
          <Input
            label="CVV"
            placeholder="123"
            type="password"
            value={cardDetails.cvv}
            onChange={handleCVVChange}
            error={errors.cvv}
          />
        </div>
      </div>
    </div>
  )
}
