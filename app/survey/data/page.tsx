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
