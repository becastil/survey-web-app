'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { CalendarIcon, Save, Send, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Survey, SurveyQuestion, SurveyAnswer } from '@/lib/types/survey';

interface SurveyResponseFormProps {
  survey: Survey;
  onSave: (answers: SurveyAnswer[], status: 'draft' | 'submitted') => void;
  initialAnswers?: SurveyAnswer[];
  organizationName?: string;
}

export function SurveyResponseForm({
  survey,
  onSave,
  initialAnswers = [],
  organizationName = "Your Organization"
}: SurveyResponseFormProps) {
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [currentSection, setCurrentSection] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Group questions by section
  const sections = survey.questions.reduce((acc, question) => {
    const section = question.section || 'General';
    if (!acc[section]) acc[section] = [];
    acc[section].push(question);
    return acc;
  }, {} as Record<string, SurveyQuestion[]>);

  const sectionNames = Object.keys(sections);
  const currentQuestions = sections[sectionNames[currentSection]] || [];

  // Initialize answers from initial data
  useEffect(() => {
    const answerMap: Record<string, any> = {};
    initialAnswers.forEach(answer => {
      answerMap[answer.questionId] = answer.value;
    });
    setAnswers(answerMap);
  }, [initialAnswers]);

  // Calculate completion percentage
  const totalQuestions = survey.questions.length;
  const answeredQuestions = Object.keys(answers).filter(key => 
    answers[key] !== undefined && answers[key] !== '' && answers[key] !== null
  ).length;
  const completionPercentage = Math.round((answeredQuestions / totalQuestions) * 100);

  const validateQuestion = (question: SurveyQuestion, value: any): string | null => {
    if (question.required && (!value || value === '')) {
      return `${question.title} is required`;
    }

    if (question.validation) {
      const { min, max, pattern } = question.validation;
      
      if (min !== undefined && Number(value) < min) {
        return `Value must be at least ${min}`;
      }
      
      if (max !== undefined && Number(value) > max) {
        return `Value must be at most ${max}`;
      }
      
      if (pattern && !new RegExp(pattern).test(value)) {
        return question.validation.customMessage || 'Invalid format';
      }
    }

    return null;
  };

  const handleAnswerChange = (questionId: string, value: any) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
    
    // Clear error when user starts typing
    if (errors[questionId]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[questionId];
        return newErrors;
      });
    }
  };

  const validateCurrentSection = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    currentQuestions.forEach(question => {
      const error = validateQuestion(question, answers[question.id]);
      if (error) {
        newErrors[question.id] = error;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateCurrentSection() && currentSection < sectionNames.length - 1) {
      setCurrentSection(currentSection + 1);
    }
  };

  const handlePrevious = () => {
    if (currentSection > 0) {
      setCurrentSection(currentSection - 1);
    }
  };

  const handleSaveDraft = () => {
    const surveyAnswers: SurveyAnswer[] = Object.entries(answers).map(([questionId, value]) => ({
      id: `answer_${Date.now()}_${questionId}`,
      responseId: '',
      questionId,
      value,
      createdAt: new Date(),
      updatedAt: new Date()
    }));
    onSave(surveyAnswers, 'draft');
  };

  const handleSubmit = () => {
    // Validate all sections
    let hasErrors = false;
    const allErrors: Record<string, string> = {};
    
    survey.questions.forEach(question => {
      const error = validateQuestion(question, answers[question.id]);
      if (error) {
        allErrors[question.id] = error;
        hasErrors = true;
      }
    });

    if (hasErrors) {
      setErrors(allErrors);
      // Go to first section with errors
      for (let i = 0; i < sectionNames.length; i++) {
        const sectionQuestions = sections[sectionNames[i]];
        if (sectionQuestions.some(q => allErrors[q.id])) {
          setCurrentSection(i);
          break;
        }
      }
      return;
    }

    const surveyAnswers: SurveyAnswer[] = Object.entries(answers).map(([questionId, value]) => ({
      id: `answer_${Date.now()}_${questionId}`,
      responseId: '',
      questionId,
      value,
      createdAt: new Date(),
      updatedAt: new Date()
    }));
    onSave(surveyAnswers, 'submitted');
  };

  const renderQuestionInput = (question: SurveyQuestion) => {
    const value = answers[question.id];
    const error = errors[question.id];

    switch (question.type) {
      case 'text':
      case 'email':
      case 'phone':
        return (
          <div>
            <Input
              type={question.type === 'email' ? 'email' : question.type === 'phone' ? 'tel' : 'text'}
              value={value || ''}
              onChange={(e) => handleAnswerChange(question.id, e.target.value)}
              placeholder={`Enter ${question.title.toLowerCase()}`}
              className={error ? 'border-red-500' : ''}
            />
            {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
          </div>
        );

      case 'number':
      case 'currency':
      case 'percentage':
        return (
          <div>
            <div className="relative">
              {question.type === 'currency' && (
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
              )}
              <Input
                type="number"
                value={value || ''}
                onChange={(e) => handleAnswerChange(question.id, Number(e.target.value))}
                placeholder="0"
                className={cn(
                  error ? 'border-red-500' : '',
                  question.type === 'currency' ? 'pl-8' : '',
                  question.type === 'percentage' ? 'pr-8' : ''
                )}
                min={question.validation?.min}
                max={question.validation?.max}
              />
              {question.type === 'percentage' && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">%</span>
              )}
            </div>
            {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
          </div>
        );

      case 'select':
        return (
          <div>
            <Select
              value={value || ''}
              onValueChange={(val) => handleAnswerChange(question.id, val)}
            >
              <SelectTrigger className={error ? 'border-red-500' : ''}>
                <SelectValue placeholder="Select an option" />
              </SelectTrigger>
              <SelectContent>
                {question.options?.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
          </div>
        );

      case 'multiselect':
        return (
          <div>
            <div className="space-y-2">
              {question.options?.map(option => (
                <div key={option.value} className="flex items-center space-x-2">
                  <Checkbox
                    checked={(value || []).includes(option.value)}
                    onCheckedChange={(checked) => {
                      const currentValues = value || [];
                      const newValues = checked
                        ? [...currentValues, option.value]
                        : currentValues.filter((v: string) => v !== option.value);
                      handleAnswerChange(question.id, newValues);
                    }}
                  />
                  <Label className="font-normal">{option.label}</Label>
                </div>
              ))}
            </div>
            {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
          </div>
        );

      case 'scale':
        return (
          <div>
            <RadioGroup
              value={value || ''}
              onValueChange={(val) => handleAnswerChange(question.id, val)}
            >
              <div className="flex justify-between">
                {question.options?.map(option => (
                  <div key={option.value} className="flex flex-col items-center">
                    <RadioGroupItem value={option.value} />
                    <Label className="mt-1 text-xs">{option.label}</Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
            {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
          </div>
        );

      case 'date':
        return (
          <div>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !value && "text-muted-foreground",
                    error && "border-red-500"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {value ? format(new Date(value), 'PPP') : 'Pick a date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={value ? new Date(value) : undefined}
                  onSelect={(date) => handleAnswerChange(question.id, date?.toISOString())}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
          </div>
        );

      default:
        return (
          <div>
            <Textarea
              value={value || ''}
              onChange={(e) => handleAnswerChange(question.id, e.target.value)}
              placeholder={`Enter ${question.title.toLowerCase()}`}
              className={error ? 'border-red-500' : ''}
              rows={3}
            />
            {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
          </div>
        );
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>{survey.title}</CardTitle>
              <CardDescription className="mt-2">{survey.description}</CardDescription>
              <p className="text-sm text-muted-foreground mt-4">
                Organization: <span className="font-semibold">{organizationName}</span>
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Year</p>
              <p className="text-2xl font-bold">{survey.year}</p>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Progress Bar */}
      {survey.settings.showProgressBar && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Overall Progress</span>
                <span className="font-semibold">{completionPercentage}%</span>
              </div>
              <Progress value={completionPercentage} className="h-2" />
              <p className="text-xs text-muted-foreground">
                {answeredQuestions} of {totalQuestions} questions answered
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Current Section */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg">
              Section {currentSection + 1} of {sectionNames.length}: {sectionNames[currentSection]}
            </CardTitle>
            <Badge variant="outline">
              {currentQuestions.length} questions
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {currentQuestions.map((question, index) => (
            <div key={question.id} className="space-y-2">
              <Label className="text-base">
                {index + 1}. {question.title}
                {question.required && <span className="text-red-500 ml-1">*</span>}
              </Label>
              {question.description && (
                <p className="text-sm text-muted-foreground">{question.description}</p>
              )}
              {renderQuestionInput(question)}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentSection === 0}
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Previous
        </Button>

        <div className="flex gap-2">
          {survey.settings.allowSaveDraft && (
            <Button variant="outline" onClick={handleSaveDraft}>
              <Save className="w-4 h-4 mr-2" />
              Save Draft
            </Button>
          )}
          
          {currentSection === sectionNames.length - 1 ? (
            <Button onClick={handleSubmit}>
              <Send className="w-4 h-4 mr-2" />
              Submit Survey
            </Button>
          ) : (
            <Button onClick={handleNext}>
              Next
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}