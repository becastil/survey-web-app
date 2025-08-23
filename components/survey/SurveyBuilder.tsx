'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Plus, Trash2, GripVertical, Copy, Save, Upload } from 'lucide-react';
import { QuestionType, SurveyQuestion } from '@/lib/types/survey';

interface SurveyBuilderProps {
  onSave: (questions: SurveyQuestion[]) => void;
  initialQuestions?: SurveyQuestion[];
}

export function SurveyBuilder({ onSave, initialQuestions = [] }: SurveyBuilderProps) {
  const [questions, setQuestions] = useState<SurveyQuestion[]>(initialQuestions);
  const [currentSection, setCurrentSection] = useState('General Information');

  const questionTypes: { value: QuestionType; label: string }[] = [
    { value: 'text', label: 'Text Input' },
    { value: 'number', label: 'Number' },
    { value: 'select', label: 'Single Select' },
    { value: 'multiselect', label: 'Multi Select' },
    { value: 'date', label: 'Date' },
    { value: 'scale', label: 'Rating Scale' },
    { value: 'currency', label: 'Currency' },
    { value: 'percentage', label: 'Percentage' },
    { value: 'email', label: 'Email' },
    { value: 'phone', label: 'Phone' },
  ];

  const addQuestion = () => {
    const newQuestion: SurveyQuestion = {
      id: `q_${Date.now()}`,
      surveyId: '',
      type: 'text',
      title: 'New Question',
      required: false,
      order: questions.length,
      section: currentSection,
    };
    setQuestions([...questions, newQuestion]);
  };

  const updateQuestion = (index: number, updates: Partial<SurveyQuestion>) => {
    const updated = [...questions];
    updated[index] = { ...updated[index], ...updates };
    setQuestions(updated);
  };

  const deleteQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const duplicateQuestion = (index: number) => {
    const questionToDuplicate = questions[index];
    const duplicated = {
      ...questionToDuplicate,
      id: `q_${Date.now()}`,
      title: `${questionToDuplicate.title} (Copy)`,
      order: questions.length,
    };
    setQuestions([...questions, duplicated]);
  };

  const moveQuestion = (index: number, direction: 'up' | 'down') => {
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === questions.length - 1)) {
      return;
    }
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    const updated = [...questions];
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
    updated[index].order = index;
    updated[newIndex].order = newIndex;
    setQuestions(updated);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Survey Builder</h2>
          <p className="text-muted-foreground">Create and customize your survey questions</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Upload className="w-4 h-4 mr-2" />
            Import Excel
          </Button>
          <Button onClick={() => onSave(questions)} size="sm">
            <Save className="w-4 h-4 mr-2" />
            Save Survey
          </Button>
        </div>
      </div>

      {/* Section Manager */}
      <Card>
        <CardHeader className="py-3">
          <div className="flex items-center justify-between">
            <Label>Current Section</Label>
            <Input
              value={currentSection}
              onChange={(e) => setCurrentSection(e.target.value)}
              className="w-64"
              placeholder="Section name..."
            />
          </div>
        </CardHeader>
      </Card>

      {/* Questions List */}
      <div className="space-y-4">
        {questions.map((question, index) => (
          <Card key={question.id} className="relative">
            <div className="absolute left-2 top-1/2 -translate-y-1/2 cursor-move">
              <GripVertical className="w-5 h-5 text-muted-foreground" />
            </div>
            <CardContent className="pl-10 pr-4 py-4">
              <div className="grid grid-cols-12 gap-4">
                {/* Question Title */}
                <div className="col-span-5">
                  <Label>Question</Label>
                  <Input
                    value={question.title}
                    onChange={(e) => updateQuestion(index, { title: e.target.value })}
                    placeholder="Enter question..."
                  />
                </div>

                {/* Question Type */}
                <div className="col-span-3">
                  <Label>Type</Label>
                  <Select
                    value={question.type}
                    onValueChange={(value: QuestionType) => updateQuestion(index, { type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {questionTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Required Toggle */}
                <div className="col-span-2 flex items-end">
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={question.required}
                      onCheckedChange={(checked) => updateQuestion(index, { required: checked })}
                    />
                    <Label>Required</Label>
                  </div>
                </div>

                {/* Actions */}
                <div className="col-span-2 flex items-end justify-end gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => moveQuestion(index, 'up')}
                    disabled={index === 0}
                  >
                    ↑
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => moveQuestion(index, 'down')}
                    disabled={index === questions.length - 1}
                  >
                    ↓
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => duplicateQuestion(index)}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteQuestion(index)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>

                {/* Options for select types */}
                {(question.type === 'select' || question.type === 'multiselect' || question.type === 'scale') && (
                  <div className="col-span-12 mt-2">
                    <Label>Options (one per line)</Label>
                    <Textarea
                      placeholder="Option 1&#10;Option 2&#10;Option 3"
                      className="h-24"
                      value={question.options?.map(o => o.label).join('\n') || ''}
                      onChange={(e) => {
                        const options = e.target.value.split('\n').filter(o => o.trim()).map((label, i) => ({
                          value: `opt_${i}`,
                          label: label.trim()
                        }));
                        updateQuestion(index, { options });
                      }}
                    />
                  </div>
                )}

                {/* Validation for number types */}
                {(question.type === 'number' || question.type === 'currency' || question.type === 'percentage') && (
                  <div className="col-span-12 mt-2 grid grid-cols-2 gap-4">
                    <div>
                      <Label>Min Value</Label>
                      <Input
                        type="number"
                        placeholder="Minimum"
                        value={question.validation?.min || ''}
                        onChange={(e) => updateQuestion(index, {
                          validation: { ...question.validation, min: Number(e.target.value) }
                        })}
                      />
                    </div>
                    <div>
                      <Label>Max Value</Label>
                      <Input
                        type="number"
                        placeholder="Maximum"
                        value={question.validation?.max || ''}
                        onChange={(e) => updateQuestion(index, {
                          validation: { ...question.validation, max: Number(e.target.value) }
                        })}
                      />
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add Question Button */}
      <Button onClick={addQuestion} variant="outline" className="w-full">
        <Plus className="w-4 h-4 mr-2" />
        Add Question
      </Button>
    </div>
  );
}