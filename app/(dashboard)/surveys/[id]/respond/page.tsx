'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { sanitizeText, sanitizeJson } from '@/lib/utils/sanitize';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { surveyService } from '@/lib/services/survey-service';
import { Survey, Question } from '@/types';
import { ChevronLeft, ChevronRight, Save, Send, CheckCircle } from 'lucide-react';

export default function SurveyRespondPage() {
  const params = useParams();
  const router = useRouter();
  const surveyId = params.id as string;

  const [survey, setSurvey] = useState<Survey | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{ [questionId: string]: string | number | string[] }>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [responseId, setResponseId] = useState<string | null>(null);

  const loadSurveyData = useCallback(async () => {
    try {
      setLoading(true);
      const [surveyData, questionsData] = await Promise.all([
        surveyService.getSurvey(surveyId),
        surveyService.getQuestions(surveyId),
      ]);

      if (!surveyData) {
        router.push('/surveys');
        return;
      }

      setSurvey(surveyData);
      setQuestions(questionsData);
    } catch (error) {
      console.error('Failed to load survey:', error);
      router.push('/surveys');
    } finally {
      setLoading(false);
    }
  }, [surveyId, router]);

  useEffect(() => {
    loadSurveyData();
    // Check if there's a saved response in progress
    if (typeof window !== 'undefined') {
      const savedProgress = localStorage.getItem(`survey-progress-${surveyId}`);
      if (savedProgress) {
        const { answers: savedAnswers, responseId: savedResponseId } = JSON.parse(savedProgress);
        setAnswers(savedAnswers);
        setResponseId(savedResponseId);
      }
    }
  }, [surveyId, loadSurveyData]);

  const handleAnswerChange = (questionId: string, value: unknown) => {
    const newAnswers = { ...answers, [questionId]: value };
    setAnswers(newAnswers);
    
    // Save progress to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem(`survey-progress-${surveyId}`, JSON.stringify({
        answers: newAnswers,
        responseId,
        timestamp: new Date().toISOString(),
      }));
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handleSaveProgress = async () => {
    try {
      setSubmitting(true);
      
      // Create or update response
      if (!responseId) {
        const response = await surveyService.submitResponse({
          survey_id: surveyId,
          status: 'in_progress',
          completion_percentage: Math.round((Object.keys(answers).length / questions.length) * 100),
        });
        setResponseId(response.id);
        
        // Save response ID to localStorage
        if (typeof window !== 'undefined') {
          localStorage.setItem(`survey-progress-${surveyId}`, JSON.stringify({
            answers,
            responseId: response.id,
            timestamp: new Date().toISOString(),
          }));
        }
      }

      // Save answers
      const answersToSubmit = Object.entries(answers).map(([questionId, value]) => ({
        response_id: responseId || `temp-${Date.now()}`,
        question_id: questionId,
        survey_id: surveyId,
        answer_value: typeof value === 'object' ? JSON.stringify(value) : String(value),
      }));

      await surveyService.submitAnswers(answersToSubmit);
      
      alert('Progress saved successfully!');
    } catch (error) {
      console.error('Failed to save progress:', error);
      alert('Failed to save progress. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      
      // Create final response
      const response = await surveyService.submitResponse({
        survey_id: surveyId,
        status: 'completed',
        completion_percentage: 100,
        completed_at: new Date().toISOString(),
      });

      // Submit all answers with sanitization
      const answersToSubmit = Object.entries(answers).map(([questionId, value]) => ({
        response_id: response.id,
        question_id: questionId,
        survey_id: surveyId,
        answer_value: typeof value === 'object' ? JSON.stringify(sanitizeJson(value)) : sanitizeText(value),
      }));

      await surveyService.submitAnswers(answersToSubmit);
      
      // Clear saved progress
      if (typeof window !== 'undefined') {
        localStorage.removeItem(`survey-progress-${surveyId}`);
      }
      
      setSubmitted(true);
    } catch (error) {
      console.error('Failed to submit survey:', error);
      alert('Failed to submit survey. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const renderQuestionInput = (question: Question) => {
    const currentAnswer = answers[question.id];

    switch (question.question_type) {
      case 'single_choice':
        return (
          <RadioGroup
            value={(currentAnswer as string) || ''}
            onValueChange={(value) => handleAnswerChange(question.id, value)}
          >
            <div className="space-y-2">
              {question.options?.map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <RadioGroupItem value={option} id={`${question.id}-${index}`} />
                  <Label htmlFor={`${question.id}-${index}`} className="cursor-pointer">
                    {option}
                  </Label>
                </div>
              ))}
            </div>
          </RadioGroup>
        );

      case 'multiple_choice':
        const selectedOptions = (currentAnswer as string[]) || [];
        return (
          <div className="space-y-2">
            {question.options?.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <Checkbox
                  id={`${question.id}-${index}`}
                  checked={(selectedOptions as string[]).includes(option)}
                  onCheckedChange={(checked) => {
                    const newSelected = checked
                      ? [...(selectedOptions as string[]), option]
                      : (selectedOptions as string[]).filter((o: string) => o !== option);
                    handleAnswerChange(question.id, newSelected);
                  }}
                />
                <Label htmlFor={`${question.id}-${index}`} className="cursor-pointer">
                  {option}
                </Label>
              </div>
            ))}
          </div>
        );

      case 'scale':
        const min = question.scale_min || 1;
        const max = question.scale_max || 10;
        return (
          <div className="space-y-4">
            <div className="flex justify-between text-sm text-gray-600">
              <span>{min} - {question.scale_label_min || 'Low'}</span>
              <span>{max} - {question.scale_label_max || 'High'}</span>
            </div>
            <Input
              type="range"
              min={min}
              max={max}
              value={(currentAnswer as number) || min}
              onChange={(e) => handleAnswerChange(question.id, parseInt(e.target.value))}
              className="w-full"
            />
            <div className="text-center text-lg font-semibold">
              {(currentAnswer as number) || min}
            </div>
          </div>
        );

      case 'text':
        return (
          <Textarea
            value={(currentAnswer as string) || ''}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            placeholder="Enter your response..."
            rows={4}
          />
        );

      case 'number':
        return (
          <Input
            type="number"
            value={(currentAnswer as string) || ''}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            placeholder="Enter a number..."
          />
        );

      case 'date':
        return (
          <Input
            type="date"
            value={(currentAnswer as string) || ''}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
          />
        );

      default:
        return (
          <Input
            type="text"
            value={(currentAnswer as string) || ''}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            placeholder="Enter your response..."
          />
        );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading survey...</div>
      </div>
    );
  }

  if (!survey || questions.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Survey not found</div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardContent className="text-center py-12">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Thank You!</h2>
            <p className="text-gray-600 mb-6">
              Your response to &quot;{survey.title}&quot; has been submitted successfully.
            </p>
            <Button onClick={() => router.push('/surveys')}>
              Back to Surveys
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
  const answeredCount = Object.keys(answers).length;
  const isComplete = answeredCount === questions.length;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Survey Header */}
      <Card>
        <CardHeader>
          <CardTitle>{survey.title}</CardTitle>
          <CardDescription>{survey.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
              <span>{answeredCount} of {questions.length} answered</span>
            </div>
            <Progress value={progress} />
          </div>
        </CardContent>
      </Card>

      {/* Current Question */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            {currentQuestion.question_text}
            {currentQuestion.required && <span className="text-red-500 ml-1">*</span>}
          </CardTitle>
          {currentQuestion.help_text && (
            <CardDescription>{currentQuestion.help_text}</CardDescription>
          )}
        </CardHeader>
        <CardContent>
          {renderQuestionInput(currentQuestion)}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between items-center">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentQuestionIndex === 0}
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Previous
        </Button>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleSaveProgress}
            disabled={submitting || answeredCount === 0}
          >
            <Save className="h-4 w-4 mr-2" />
            Save Progress
          </Button>
        </div>

        {currentQuestionIndex === questions.length - 1 ? (
          <Button
            onClick={handleSubmit}
            disabled={submitting || !isComplete}
          >
            <Send className="h-4 w-4 mr-2" />
            Submit Survey
          </Button>
        ) : (
          <Button
            onClick={handleNext}
          >
            Next
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        )}
      </div>

      {/* Question Navigation Grid */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Quick Navigation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-10 gap-2">
            {questions.map((q, index) => (
              <button
                key={q.id}
                onClick={() => setCurrentQuestionIndex(index)}
                className={`
                  p-2 text-xs rounded-md transition-colors
                  ${index === currentQuestionIndex 
                    ? 'bg-primary text-white' 
                    : answers[q.id] 
                      ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                      : 'bg-gray-100 hover:bg-gray-200'
                  }
                `}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}