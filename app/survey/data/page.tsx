'use client';

import React from 'react';
import Link from 'next/link';
import {
  PieChart,
  Pie,
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  planTypeData,
  regionalData,
  unionData,
  dentalBenefitsData,
  voluntaryBenefitsData,
  ptoData,
  COLORS,
} from '@/lib/surveyChartData';

export default function SurveyDataPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/survey"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4"
          >
            ← Back to Survey
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Healthcare Benefits Survey
          </h1>
          <p className="text-gray-600">
            Data visualization and analysis of healthcare benefits trends
          </p>
        </div>

        {/* Key Metrics Tiles */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Plans */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Plan Types</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">5</p>
              </div>
              <div className="bg-blue-100 rounded-full p-3">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">HMO, EPO, PPO, HDHP, POS</p>
          </div>

          {/* Top Plan */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Most Popular</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">HMO</p>
              </div>
              <div className="bg-green-100 rounded-full p-3">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">61% of all plans</p>
          </div>

          {/* Union Representation */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Union Represented</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">35%</p>
              </div>
              <div className="bg-purple-100 rounded-full p-3">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">Of all employees</p>
          </div>

          {/* Dental Coverage */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Full Dental</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">68%</p>
              </div>
              <div className="bg-orange-100 rounded-full p-3">
                <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">Full coverage offered</p>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="space-y-8">
          {/* Plan Type Distribution */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Plan Type Distribution
            </h2>
            <ResponsiveContainer width="100%" height={400}>
              <PieChart>
                <Pie
                  data={planTypeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percentage }) => `${name}: ${percentage}%`}
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {planTypeData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS.primary[index % COLORS.primary.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Regional Employee Contributions */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Employee vs Employer Contributions by Region
            </h2>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={regionalData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="region" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="employeeContribution" fill="#FF8042" name="Employee %" />
                <Bar dataKey="employerContribution" fill="#00C49F" name="Employer %" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Union Representation */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Union Representation
            </h2>
            <ResponsiveContainer width="100%" height={400}>
              <PieChart>
                <Pie
                  data={unionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ category, percentage }) =>
                    `${category}: ${percentage}%`
                  }
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="percentage"
                >
                  {unionData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS.gradient[index % COLORS.gradient.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Dental Benefits */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Dental Benefits Participation
            </h2>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={dentalBenefitsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="benefit" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="percentage" fill="#0088FE" name="Percentage %" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Voluntary Benefits */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Voluntary Benefits Offered
            </h2>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={voluntaryBenefitsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="benefit" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="offered" fill="#82ca9d" name="Offered %" />
                <Bar dataKey="notOffered" fill="#ff7c7c" name="Not Offered %" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* PTO Programs */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              PTO Programs Distribution
            </h2>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={ptoData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="program" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="percentage" fill="#8884D8" name="Percentage %" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            * This is a proof of concept with dummy data
          </p>
        </div>
      </div>
    </div>
  );
}
