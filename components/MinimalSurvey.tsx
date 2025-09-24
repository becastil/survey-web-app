'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'

interface Question {
  id: string
  text: string
  type: 'text' | 'number' | 'yesno' | 'multiple'
  options?: string[]
}

const questions: Question[] = [
  {
    id: 'organization_name',
    text: 'Organization name?',
    type: 'text'
  },
  {
    id: 'employee_count',
    text: 'Number of employees?',
    type: 'number'
  },
  {
    id: 'contact_email',
    text: 'Contact email?',
    type: 'text'
  },
  {
    id: 'has_medical',
    text: 'Medical benefits?',
    type: 'yesno'
  },
  {
    id: 'plan_types',
    text: 'Select plan types:',
    type: 'multiple',
    options: ['HMO', 'PPO', 'HDHP', 'EPO']
  }
]

export default function MinimalSurvey() {
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<Record<string, any>>({})
  const [currentInput, setCurrentInput] = useState('')
  const [selectedOptions, setSelectedOptions] = useState<string[]>([])
  const [showingComplete, setShowingComplete] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const currentQuestion = questions[step]
  const isComplete = step >= questions.length

  useEffect(() => {
    if (!isComplete && inputRef.current) {
      inputRef.current.focus()
    }
  }, [step, isComplete])

  const handleNext = async () => {
    let value: any = currentInput

    if (currentQuestion.type === 'yesno') {
      value = currentInput.toLowerCase() === 'y' || currentInput.toLowerCase() === 'yes'
    } else if (currentQuestion.type === 'multiple') {
      value = selectedOptions
    } else if (currentQuestion.type === 'number') {
      value = parseInt(currentInput) || 0
    }

    const newAnswers = { ...answers, [currentQuestion.id]: value }
    setAnswers(newAnswers)
    setCurrentInput('')
    setSelectedOptions([])
    
    const nextStep = step + 1
    setStep(nextStep)
    
    // Save to backend when complete
    if (nextStep >= questions.length) {
      setShowingComplete(true)
      await saveResponse(newAnswers)
      
      // Redirect to completion page after showing checkmark
      setTimeout(() => {
        router.push('/survey/complete')
      }, 1500)
    }
  }

  const handlePrevious = () => {
    if (step > 0) {
      setStep(step - 1)
      const prevQuestion = questions[step - 1]
      const prevAnswer = answers[prevQuestion.id]
      
      if (prevQuestion.type === 'multiple') {
        setSelectedOptions(Array.isArray(prevAnswer) ? prevAnswer : [])
        setCurrentInput('')
      } else if (prevQuestion.type === 'yesno') {
        setCurrentInput(prevAnswer ? 'y' : 'n')
      } else {
        setCurrentInput(prevAnswer?.toString() || '')
      }
    }
  }

  const saveResponse = async (responseData: Record<string, any>) => {
    try {
      // Check if Supabase environment variables are available
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL
      const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      
      if (!url || !key) {
        console.log('Supabase not configured, skipping save')
        console.log('Response data:', responseData)
        return
      }
      
      const supabase = createClient(url, key)
      
      const { error } = await supabase
        .from('response_sets')
        .insert({
          survey_version_id: 'minimal-survey-v1',
          status: 'submitted',
          created_by: '00000000-0000-0000-0000-000000000000' // anonymous for now
        })
      
      if (error) {
        console.error('Supabase error:', error)
      } else {
        console.log('Response saved:', responseData)
      }
    } catch (error) {
      console.error('Error saving response:', error)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && currentInput.trim()) {
      handleNext()
    } else if (e.key === 'Escape') {
      handlePrevious()
    }
  }

  const handleMultipleKeyDown = (e: React.KeyboardEvent, option: string) => {
    if (e.key === ' ') {
      e.preventDefault()
      setSelectedOptions(prev => 
        prev.includes(option) 
          ? prev.filter(o => o !== option)
          : [...prev, option]
      )
    } else if (e.key === 'Enter' && selectedOptions.length > 0) {
      handleNext()
    } else if (e.key === 'Escape') {
      handlePrevious()
    }
  }

  if (isComplete) {
    return (
      <div className="minimal-container">
        <div className="minimal-done">✓</div>
        <p className="minimal-hint" style={{ marginTop: '20px', color: '#666' }}>
          Redirecting...
        </p>
        <button 
          onClick={() => router.push('/survey/complete')}
          className="minimal-option"
          style={{ marginTop: '10px', cursor: 'pointer' }}
        >
          Continue →
        </button>
      </div>
    )
  }

  return (
    <div className="minimal-container">
      <h1 className="minimal-question">{currentQuestion.text}</h1>
      
      {currentQuestion.type === 'multiple' ? (
        <div className="minimal-options">
          {currentQuestion.options?.map((option, index) => (
            <div
              key={option}
              tabIndex={0}
              className={`minimal-option ${selectedOptions.includes(option) ? 'selected' : ''}`}
              onKeyDown={(e) => handleMultipleKeyDown(e, option)}
              onClick={() => setSelectedOptions(prev => 
                prev.includes(option) 
                  ? prev.filter(o => o !== option)
                  : [...prev, option]
              )}
            >
              {selectedOptions.includes(option) ? '●' : '○'} {option}
            </div>
          ))}
          <div className="minimal-hint">SPACE to select, ENTER to continue</div>
        </div>
      ) : currentQuestion.type === 'yesno' ? (
        <div className="minimal-yesno">
          <input
            ref={inputRef}
            className="minimal-input"
            value={currentInput}
            onChange={(e) => setCurrentInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="y / n"
            maxLength={3}
          />
        </div>
      ) : (
        <input
          ref={inputRef}
          className="minimal-input"
          type={currentQuestion.type === 'number' ? 'number' : 'text'}
          value={currentInput}
          onChange={(e) => setCurrentInput(e.target.value)}
          onKeyDown={handleKeyDown}
          autoFocus
        />
      )}
    </div>
  )
}