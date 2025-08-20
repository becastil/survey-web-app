'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { surveyService } from '@/lib/services/survey-service';
import { Question } from '@/types';
import { Plus, Trash2, GripVertical, Eye, Save, ArrowLeft, Copy } from 'lucide-react';
import { sanitizeText, sanitizeJson } from '@/lib/utils/sanitize';

type QuestionType = Question['question_type'];

interface QuestionBuilder extends Omit<Question, 'id' | 'survey_id'> {
  tempId: string;
}

export default function NewSurveyPage() {
  const router = useRouter();
  const [surveyTitle, setSurveyTitle] = useState('');
  const [surveyDescription, setSurveyDescription] = useState('');
  const [surveyStatus, setSurveyStatus] = useState<'draft' | 'active'>('draft');
  const [questions, setQuestions] = useState<QuestionBuilder[]>([]);
  const [saving, setSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  const addQuestion = () => {
    const newQuestion: QuestionBuilder = {
      tempId: `temp-${Date.now()}`,
      question_type: 'single_choice',
      question_text: '',
      help_text: '',
      required: false,
      order: questions.length,
      options: ['Option 1', 'Option 2'],
    };
    setQuestions([...questions, newQuestion]);
  };

  const updateQuestion = (index: number, updates: Partial<QuestionBuilder>) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index] = { ...updatedQuestions[index], ...updates };
    setQuestions(updatedQuestions);
  };

  const deleteQuestion = (index: number) => {
    const updatedQuestions = questions.filter((_, i) => i !== index);
    // Reorder questions
    updatedQuestions.forEach((q, i) => {
      q.order = i;
    });
    setQuestions(updatedQuestions);
  };

  const duplicateQuestion = (index: number) => {
    const questionToDuplicate = questions[index];
    const newQuestion: QuestionBuilder = {
      ...questionToDuplicate,
      tempId: `temp-${Date.now()}`,
      order: index + 1,
    };
    
    const updatedQuestions = [
      ...questions.slice(0, index + 1),
      newQuestion,
      ...questions.slice(index + 1),
    ];
    
    // Reorder questions
    updatedQuestions.forEach((q, i) => {
      q.order = i;
    });
    
    setQuestions(updatedQuestions);
  };

  const moveQuestion = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === questions.length - 1)
    ) {
      return;
    }
    
    const updatedQuestions = [...questions];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    // Swap questions
    [updatedQuestions[index], updatedQuestions[targetIndex]] = 
    [updatedQuestions[targetIndex], updatedQuestions[index]];
    
    // Update order
    updatedQuestions[index].order = index;
    updatedQuestions[targetIndex].order = targetIndex;
    
    setQuestions(updatedQuestions);
  };

  const addOption = (questionIndex: number) => {
    const question = questions[questionIndex];
    const options = question.options || [];
    updateQuestion(questionIndex, {
      options: [...options, `Option ${options.length + 1}`],
    });
  };

  const updateOption = (questionIndex: number, optionIndex: number, value: string) => {
    const question = questions[questionIndex];
    const options = [...(question.options || [])];
    options[optionIndex] = value;
    updateQuestion(questionIndex, { options });
  };

  const deleteOption = (questionIndex: number, optionIndex: number) => {
    const question = questions[questionIndex];
    const options = (question.options || []).filter((_, i) => i !== optionIndex);
    updateQuestion(questionIndex, { options });
  };

  const handleSave = async () => {
    if (!surveyTitle || questions.length === 0) {
      alert('Please provide a survey title and at least one question');
      return;
    }

    try {
      setSaving(true);
      
      // Create the survey with sanitized data
      const survey = await surveyService.createSurvey({
        title: sanitizeText(surveyTitle),
        description: sanitizeText(surveyDescription),
        status: surveyStatus,
        created_by: 'current-user', // Mock user
      });
      
      // Create questions with sanitization
      for (const question of questions) {
        const { tempId, ...questionData } = question;
        // tempId is used for React keys but not needed in the API call
        await surveyService.createQuestion({
          ...sanitizeJson(questionData),
          survey_id: survey.id,
        });
      }
      
      alert('Survey created successfully!');
      router.push('/surveys');
    } catch (error) {
      console.error('Failed to save survey:', error);
      alert('Failed to save survey. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const renderQuestionBuilder = (question: QuestionBuilder, index: number) => {
    return (
      <Card key={question.tempId} className="mb-4">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <GripVertical className="h-4 w-4 text-gray-400 cursor-move" />
              <span className="text-sm font-medium">Question {index + 1}</span>
            </div>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => moveQuestion(index, 'up')}
                disabled={index === 0}
              >
                ↑
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => moveQuestion(index, 'down')}
                disabled={index === questions.length - 1}
              >
                ↓
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => duplicateQuestion(index)}
              >
                <Copy className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => deleteQuestion(index)}
              >
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor={`type-${index}`}>Question Type</Label>
              <Select
                value={question.question_type}
                onValueChange={(value: QuestionType) => updateQuestion(index, { question_type: value })}
              >
                <SelectTrigger id={`type-${index}`}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="single_choice">Single Choice</SelectItem>
                  <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                  <SelectItem value="scale">Scale/Rating</SelectItem>
                  <SelectItem value="text">Text Input</SelectItem>
                  <SelectItem value="number">Number</SelectItem>
                  <SelectItem value="date">Date</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2 pt-6">
              <Checkbox
                id={`required-${index}`}
                checked={question.required}
                onCheckedChange={(checked) => updateQuestion(index, { required: !!checked })}
              />
              <Label htmlFor={`required-${index}`} className="cursor-pointer">
                Required question
              </Label>
            </div>
          </div>

          <div>
            <Label htmlFor={`text-${index}`}>Question Text</Label>
            <Input
              id={`text-${index}`}
              value={question.question_text}
              onChange={(e) => updateQuestion(index, { question_text: e.target.value })}
              placeholder="Enter your question..."
            />
          </div>

          <div>
            <Label htmlFor={`help-${index}`}>Help Text (optional)</Label>
            <Input
              id={`help-${index}`}
              value={question.help_text || ''}
              onChange={(e) => updateQuestion(index, { help_text: e.target.value })}
              placeholder="Additional instructions or context..."
            />
          </div>

          {/* Options for choice questions */}
          {(question.question_type === 'single_choice' || question.question_type === 'multiple_choice') && (
            <div>
              <Label>Options</Label>
              <div className="space-y-2">
                {(question.options || []).map((option, optionIndex) => (
                  <div key={optionIndex} className="flex gap-2">
                    <Input
                      value={option}
                      onChange={(e) => updateOption(index, optionIndex, e.target.value)}
                      placeholder={`Option ${optionIndex + 1}`}
                    />
                    {(question.options?.length || 0) > 2 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteOption(index, optionIndex)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => addOption(index)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Option
                </Button>
              </div>
            </div>
          )}

          {/* Scale configuration */}
          {question.question_type === 'scale' && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor={`scale-min-${index}`}>Min Value</Label>
                <Input
                  id={`scale-min-${index}`}
                  type="number"
                  value={question.scale_min || 1}
                  onChange={(e) => updateQuestion(index, { scale_min: parseInt(e.target.value) })}
                />
              </div>
              <div>
                <Label htmlFor={`scale-max-${index}`}>Max Value</Label>
                <Input
                  id={`scale-max-${index}`}
                  type="number"
                  value={question.scale_max || 10}
                  onChange={(e) => updateQuestion(index, { scale_max: parseInt(e.target.value) })}
                />
              </div>
              <div>
                <Label htmlFor={`scale-min-label-${index}`}>Min Label</Label>
                <Input
                  id={`scale-min-label-${index}`}
                  value={question.scale_label_min || ''}
                  onChange={(e) => updateQuestion(index, { scale_label_min: e.target.value })}
                  placeholder="e.g., Strongly Disagree"
                />
              </div>
              <div>
                <Label htmlFor={`scale-max-label-${index}`}>Max Label</Label>
                <Input
                  id={`scale-max-label-${index}`}
                  value={question.scale_label_max || ''}
                  onChange={(e) => updateQuestion(index, { scale_label_max: e.target.value })}
                  placeholder="e.g., Strongly Agree"
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  const renderPreview = () => {
    return (
      <div className="space-y-4">
        {questions.map((question, index) => (
          <Card key={question.tempId}>
            <CardHeader>
              <CardTitle className="text-lg">
                {question.question_text || `Question ${index + 1}`}
                {question.required && <span className="text-red-500 ml-1">*</span>}
              </CardTitle>
              {question.help_text && (
                <CardDescription>{question.help_text}</CardDescription>
              )}
            </CardHeader>
            <CardContent>
              {question.question_type === 'single_choice' && (
                <RadioGroup disabled>
                  {(question.options || []).map((option, i) => (
                    <div key={i} className="flex items-center space-x-2">
                      <RadioGroupItem value={option} id={`preview-${index}-${i}`} />
                      <Label htmlFor={`preview-${index}-${i}`}>{option}</Label>
                    </div>
                  ))}
                </RadioGroup>
              )}
              {question.question_type === 'multiple_choice' && (
                <div className="space-y-2">
                  {(question.options || []).map((option, i) => (
                    <div key={i} className="flex items-center space-x-2">
                      <Checkbox id={`preview-check-${index}-${i}`} disabled />
                      <Label htmlFor={`preview-check-${index}-${i}`}>{option}</Label>
                    </div>
                  ))}
                </div>
              )}
              {question.question_type === 'scale' && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>{question.scale_min || 1} - {question.scale_label_min || 'Low'}</span>
                    <span>{question.scale_max || 10} - {question.scale_label_max || 'High'}</span>
                  </div>
                  <Input type="range" disabled />
                </div>
              )}
              {question.question_type === 'text' && (
                <Textarea disabled placeholder="Text response..." />
              )}
              {question.question_type === 'number' && (
                <Input type="number" disabled placeholder="Number..." />
              )}
              {question.question_type === 'date' && (
                <Input type="date" disabled />
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push('/surveys')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h2 className="text-2xl font-bold text-gray-900">Create New Survey</h2>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setPreviewMode(!previewMode)}
          >
            <Eye className="h-4 w-4 mr-2" />
            {previewMode ? 'Edit' : 'Preview'}
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save Survey'}
          </Button>
        </div>
      </div>

      {!previewMode ? (
        <>
          {/* Survey Details */}
          <Card>
            <CardHeader>
              <CardTitle>Survey Details</CardTitle>
              <CardDescription>Basic information about your survey</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Survey Title</Label>
                <Input
                  id="title"
                  value={surveyTitle}
                  onChange={(e) => setSurveyTitle(e.target.value)}
                  placeholder="e.g., Employee Satisfaction Survey 2025"
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={surveyDescription}
                  onChange={(e) => setSurveyDescription(e.target.value)}
                  placeholder="Briefly describe the purpose of this survey..."
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="status">Initial Status</Label>
                <Select value={surveyStatus} onValueChange={(value: 'draft' | 'active') => setSurveyStatus(value)}>
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft (not visible to respondents)</SelectItem>
                    <SelectItem value="active">Active (immediately available)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Questions */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Questions</h3>
              <Button onClick={addQuestion}>
                <Plus className="h-4 w-4 mr-2" />
                Add Question
              </Button>
            </div>
            
            {questions.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <p className="text-gray-500 mb-4">No questions added yet</p>
                  <Button onClick={addQuestion}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Question
                  </Button>
                </CardContent>
              </Card>
            ) : (
              questions.map((question, index) => renderQuestionBuilder(question, index))
            )}
          </div>
        </>
      ) : (
        <>
          {/* Preview Mode */}
          <Card>
            <CardHeader>
              <CardTitle>{surveyTitle || 'Untitled Survey'}</CardTitle>
              <CardDescription>{surveyDescription || 'No description provided'}</CardDescription>
            </CardHeader>
          </Card>
          
          {questions.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <p className="text-gray-500">No questions to preview</p>
              </CardContent>
            </Card>
          ) : (
            renderPreview()
          )}
        </>
      )}
    </div>
  );
}