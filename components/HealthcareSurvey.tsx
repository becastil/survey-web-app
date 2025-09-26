// Healthcare Benefits Survey - Modern Web Implementation
// This is a cleaner, more user-friendly version of the Keenan survey

// ===========================
// 3. React Component Implementation
// ===========================

'use client';

import Link from "next/link";
import type { ReactNode } from "react";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";
import { FunctionFactory, Model, StylesManager } from "survey-core";
import { Survey } from "survey-react-ui";
import { useRouter } from "next/navigation";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { healthcareBenefitsSurvey } from "../config/healthcareBenefitsSurvey";
import { SurveySection } from "../types/survey.types";
import "survey-core/defaultV2.css";

StylesManager.applyTheme("defaultV2");

const STORAGE_KEY = "survey-responses";

const sanitizeSurveyData = (data: any) => {
  try {
    return JSON.parse(JSON.stringify(data ?? {}));
  } catch (error) {
    console.warn("Unable to sanitize survey data:", error);
    return {};
  }
};

type FlattenedSurveyRecord = Record<string, string>;

const flattenSurveyData = (input: any): FlattenedSurveyRecord => {
  const result: FlattenedSurveyRecord = {};

  const traverse = (value: any, path: string) => {
    if (value === null || value === undefined) {
      if (path) {
        result[path] = "";
      }
      return;
    }

    if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
      result[path] = String(value);
      return;
    }

    if (Array.isArray(value)) {
      if (value.length === 0) {
        if (path) {
          result[path] = "[]";
        }
        return;
      }

      value.forEach((item, index) => {
        const nextPath = path ? `${path}[${index}]` : `[${index}]`;
        traverse(item, nextPath);
      });
      return;
    }

    if (typeof value === "object") {
      const entries = Object.entries(value);
      if (entries.length === 0) {
        if (path) {
          result[path] = "{}";
        }
        return;
      }

      entries.forEach(([key, val]) => {
        const nextPath = path ? `${path}.${key}` : key;
        traverse(val, nextPath);
      });
      return;
    }

    result[path] = String(value);
  };

  traverse(input, "");

  return result;
};

const escapeCsvValue = (input: string) => input.replace(/"/g, "\"\"");

const createCsvContent = (flattened: FlattenedSurveyRecord): string => {
  const lines = ['"Field","Value"'];
  Object.entries(flattened).forEach(([field, value]) => {
    const normalizedValue = value.replace(/\r?\n/g, " ");
    lines.push(`"${escapeCsvValue(field)}","${escapeCsvValue(normalizedValue)}"`);
  });
  return lines.join("\n");
};

FunctionFactory.Instance.register("getTierName", (params: unknown[]) => {
  const [rowIndexParam, rateStructureTypeParam] = params ?? [];

  const tiersByStructure: Record<string, string[]> = {
    structure1: [
      "Employee Only",
      "Employee +1",
      "Employee +2 or more",
      "Employee +3 or more"
    ],
    structure2: [
      "Employee Only",
      "Employee +Spouse/DP",
      "Employee +Children",
      "Employee +Family"
    ]
  };

  const rateStructureType =
    typeof rateStructureTypeParam === "string" && tiersByStructure[rateStructureTypeParam]
      ? rateStructureTypeParam
      : "structure1";

  const tiers = tiersByStructure[rateStructureType];
  const normalizedIndex = typeof rowIndexParam === "number"
    ? rowIndexParam
    : parseInt(String(rowIndexParam ?? 0), 10);

  if (Number.isNaN(normalizedIndex) || normalizedIndex < 0 || normalizedIndex >= tiers.length) {
    return "Coverage Tier";
  }

  return tiers[normalizedIndex];
});

interface SurveyNavigationProps {
  sections: SurveySection[];
  currentSection: number;
  onSectionChange: (index: number) => void;
  completedSections: Set<number>;
}

const SurveyNavigation: React.FC<SurveyNavigationProps> = ({
  sections,
  currentSection,
  onSectionChange,
  completedSections
}) => {
  const groupedSections = useMemo(() => {
    type NavigationGroup = {
      id: string;
      title: string;
      icon?: string;
      isCollapsible: boolean;
      items: Array<{ section: SurveySection; index: number }>;
    };

    const groups: NavigationGroup[] = [];
    const groupIndexMap = new Map<string, number>();

    sections.forEach((section, index) => {
      if (section.navigationGroup) {
        const { id, title, icon } = section.navigationGroup;
        const existingGroupIndex = groupIndexMap.get(id);

        if (existingGroupIndex !== undefined) {
          groups[existingGroupIndex].items.push({ section, index });
        } else {
          groups.push({
            id,
            title,
            icon: icon ?? section.icon,
            isCollapsible: true,
            items: [{ section, index }]
          });
          groupIndexMap.set(id, groups.length - 1);
        }
      } else {
        groups.push({
          id: section.id,
          title: section.title,
          icon: section.icon,
          isCollapsible: false,
          items: [{ section, index }]
        });
      }
    });

    return groups;
  }, [sections]);

  const [openGroups, setOpenGroups] = useState<Set<string>>(() => new Set());

  useEffect(() => {
    const activeGroup = groupedSections.find(group =>
      group.items.some(item => item.index === currentSection)
    );

    if (activeGroup?.isCollapsible) {
      setOpenGroups(prev => {
        if (prev.has(activeGroup.id)) {
          return prev;
        }
        const next = new Set(prev);
        next.add(activeGroup.id);
        return next;
      });
    }
  }, [currentSection, groupedSections]);

  const toggleGroup = useCallback((groupId: string) => {
    setOpenGroups(prev => {
      const next = new Set(prev);
      if (next.has(groupId)) {
        next.delete(groupId);
      } else {
        next.add(groupId);
      }
      return next;
    });
  }, []);

  return (
    <nav className="w-64 bg-white border-r border-gray-200 h-screen sticky top-0 overflow-y-auto">
      <div className="p-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Survey Sections</h2>
        <ul className="space-y-1">
          {groupedSections.map(group => {
            const groupHasActive = group.items.some(item => item.index === currentSection);
            const groupCompleted = group.items.length > 0 && group.items.every(item => completedSections.has(item.index));

            if (!group.isCollapsible) {
              const { section, index } = group.items[0];
              const isActive = currentSection === index;
              const isCompleted = completedSections.has(index);

              return (
                <li key={group.id}>
                  <button
                    type="button"
                    onClick={() => onSectionChange(index)}
                    className={`
                      w-full text-left px-3 py-2 rounded-lg transition-colors
                      flex items-center justify-between
                      ${isActive
                        ? "bg-blue-50 text-blue-700 border-l-4 border-blue-700"
                        : "hover:bg-gray-50 text-gray-700"
                      }
                    `}
                  >
                    <div className="flex items-center">
                      <span className="mr-2">{getIcon(section.icon)}</span>
                      <span className="text-sm font-medium">{section.title}</span>
                    </div>
                    {(isCompleted || groupCompleted) && (
                      <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                </li>
              );
            }

            const isOpen = openGroups.has(group.id);

            return (
              <li key={group.id}>
                <button
                  type="button"
                  onClick={() => toggleGroup(group.id)}
                  className={`
                    w-full text-left px-3 py-2 rounded-lg transition-colors
                    flex items-center justify-between
                    ${groupHasActive
                      ? "bg-blue-50 text-blue-700 border-l-4 border-blue-700"
                      : "hover:bg-gray-50 text-gray-700"
                    }
                  `}
                >
                  <div className="flex items-center">
                    <span className={`mr-2 transition-transform ${isOpen ? "rotate-90" : ""}`}>
                      <ChevronRightIcon />
                    </span>
                    <span className="mr-2">{getIcon(group.icon)}</span>
                    <span className="text-sm font-semibold">{group.title}</span>
                  </div>
                  {groupCompleted && (
                    <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>

                {isOpen && (
                  <ul className="mt-1 space-y-1 pl-6">
                    {group.items.map(({ section, index }) => {
                      const isActive = currentSection === index;
                      const isCompleted = completedSections.has(index);

                      return (
                        <li key={section.id}>
                          <button
                            type="button"
                            onClick={() => onSectionChange(index)}
                            className={`
                              w-full text-left px-3 py-2 rounded-lg transition-colors
                              flex items-center justify-between text-sm
                              ${isActive
                                ? "bg-blue-50 text-blue-700 border-l-4 border-blue-700"
                                : "hover:bg-gray-50 text-gray-600"
                              }
                            `}
                          >
                            <div className="flex items-center">
                              <span className="mr-2 text-gray-400">
                                <DotIcon />
                              </span>
                              <span className="mr-2">{getIcon(section.icon)}</span>
                              <span className="font-medium">{section.title}</span>
                            </div>
                            {isCompleted && (
                              <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                            )}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
};

interface ProgressBarProps {
  current: number;
  total: number;
  sectionTitle: string;
  rightSlot?: ReactNode;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ current, total, sectionTitle, rightSlot }) => {
  const percentage = (current / total) * 100;

  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-700">{sectionTitle}</h3>
            <span className="text-sm text-gray-500">
              Section {current} of {total}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
        {rightSlot ? (
          <div className="flex flex-wrap items-center gap-2 lg:justify-end">
            {rightSlot}
          </div>
        ) : null}
      </div>
    </div>
  );
};

const convertSectionToSurveyJS = (section: SurveySection) => {
  return {
    title: section.title,
    description: section.description,
    pages: section.pages,
    showProgressBar: "top",
    progressBarType: "pages",
    firstPageIsStarted: false,
    showPreviewBeforeComplete: "showAllQuestions"
  };
};

const getIcon = (iconName?: string) => {
  const icons: Record<string, ReactNode> = {
    building: <BuildingIcon />,
    hospital: <HospitalIcon />,
    tooth: <ToothIcon />,
    eye: <EyeIcon />,
    shield: <ShieldIcon />,
    "piggy-bank": <PiggyBankIcon />,
    calendar: <CalendarIcon />,
    strategy: <StrategyIcon />
  };
  return icons[iconName || "building"] || <BuildingIcon />;
};

export default function HealthcareBenefitsSurvey() {
  const router = useRouter();
  const supabase = useMemo<SupabaseClient | null>(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !key) {
      if (process.env.NODE_ENV !== "production") {
        console.warn(
          "Supabase environment variables are not set. Auto-save and submission features are disabled."
        );
      }
      return null;
    }

    return createClient(url, key);
  }, []);

  const initialResponses = useMemo<Record<string, any>>(() => {
    if (typeof window === "undefined") {
      return {};
    }

    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.error("Failed to parse stored survey responses:", error);
      return {};
    }
  }, []);

  const initialCompletedSet = useMemo(() => {
    const seeded = new Set<number>();
    healthcareBenefitsSurvey.sections.forEach((section, index) => {
      const data = initialResponses[section.id];
      if (data && Object.keys(data).length > 0) {
        seeded.add(index);
      }
    });
    return seeded;
  }, [initialResponses]);

  const [surveyModel, setSurveyModel] = useState<Model | null>(null);
  const [currentSection, setCurrentSection] = useState(0);
  const [completedSections, setCompletedSections] = useState<Set<number>>(() => new Set(initialCompletedSet));
  const [isSaving, setIsSaving] = useState(false);
  const [allResponses, setAllResponses] = useState<Record<string, any>>(initialResponses);

  const allResponsesRef = useRef<Record<string, any>>(initialResponses);

  useEffect(() => {
    allResponsesRef.current = allResponses;
  }, [allResponses]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(allResponses));
    } catch (error) {
      console.error("Failed to persist survey responses:", error);
    }
  }, [allResponses]);

  const downloadFile = useCallback((filename: string, content: string, mimeType: string) => {
    if (typeof window === "undefined") {
      return;
    }

    const blob = new Blob([content], { type: mimeType });
    const url = window.URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    window.setTimeout(() => window.URL.revokeObjectURL(url), 0);
  }, []);

  const hasResponses = useMemo(() => {
    return Object.values(allResponses).some(sectionData => sectionData && Object.keys(sectionData).length > 0);
  }, [allResponses]);

  const handleExportJson = useCallback(() => {
    if (!hasResponses) {
      return;
    }
    const content = JSON.stringify(allResponses, null, 2);
    downloadFile("healthcare-benefits-survey.json", content, "application/json");
  }, [allResponses, downloadFile, hasResponses]);

  const handleExportCsv = useCallback(() => {
    if (!hasResponses) {
      return;
    }

    const flattened = flattenSurveyData(allResponses);
    const csvContent = createCsvContent(flattened);
    downloadFile("healthcare-benefits-survey.csv", csvContent, "text/csv");
  }, [allResponses, downloadFile, hasResponses]);

  const saveSectionData = useCallback(
    async (sectionIndex: number, data: any) => {
      if (!supabase) {
        return;
      }

      setIsSaving(true);
      try {
        const sanitized = sanitizeSurveyData(data);
        const { error } = await supabase
          .from("survey_responses")
          .upsert({
            survey_id: healthcareBenefitsSurvey.id,
            section_id: healthcareBenefitsSurvey.sections[sectionIndex].id,
            response_data: sanitized,
            updated_at: new Date().toISOString()
          });

        if (error) throw error;
      } catch (error) {
        console.error("Error saving survey data:", error);
      } finally {
        setIsSaving(false);
      }
    },
    [supabase]
  );

  const submitCompleteSurvey = useCallback(async () => {
    if (!supabase) {
      return;
    }

    const { error } = await supabase
      .from("survey_submissions")
      .insert({
        survey_id: healthcareBenefitsSurvey.id,
        completed_at: new Date().toISOString(),
        status: "completed"
      });

    if (error) {
      console.error("Error submitting complete survey:", error);
    }
  }, [supabase]);

  const handleSectionComplete = useCallback(
    async (sectionIndex: number, data: any) => {
      const sectionId = healthcareBenefitsSurvey.sections[sectionIndex].id;
      const sanitized = sanitizeSurveyData(data);

      setAllResponses(prev => ({ ...prev, [sectionId]: sanitized }));
      allResponsesRef.current = { ...allResponsesRef.current, [sectionId]: sanitized };

      setCompletedSections(prev => {
        const next = new Set(prev);
        next.add(sectionIndex);
        return next;
      });

      await saveSectionData(sectionIndex, sanitized);

      if (sectionIndex < healthcareBenefitsSurvey.sections.length - 1) {
        setCurrentSection(sectionIndex + 1);
      } else {
        await submitCompleteSurvey();
        router.push("/survey/complete");
      }
    },
    [router, saveSectionData, submitCompleteSurvey]
  );

  const debouncedSave = useMemo(
    () =>
      debounce((sectionIndex: number, data: any) => {
        saveSectionData(sectionIndex, data);
      }, 2000),
    [saveSectionData]
  );

  useEffect(() => {
    const sectionIndex = currentSection;
    const section = healthcareBenefitsSurvey.sections[sectionIndex];
    const model = new Model(convertSectionToSurveyJS(section));

    model.showProgressBar = "top";
    model.progressBarType = "pages";
    model.showCompletedPage = false;
    model.showNavigationButtons = "both";
    model.showQuestionNumbers = "onPage";
    model.questionsOnPageMode = "singlePage";

    const storedSectionData = sanitizeSurveyData(allResponsesRef.current[section.id]);
    model.data = storedSectionData;

    model.onValueChanged.add((sender) => {
      const sanitized = sanitizeSurveyData(sender.data);
      allResponsesRef.current = { ...allResponsesRef.current, [section.id]: sanitized };
      setAllResponses(prev => ({ ...prev, [section.id]: sanitized }));
      debouncedSave(sectionIndex, sanitized);
    });

    model.onComplete.add((sender) => {
      handleSectionComplete(sectionIndex, sender.data);
    });

    setSurveyModel(model);

    return () => {
      model.dispose();
    };
  }, [currentSection, debouncedSave, handleSectionComplete]);

  if (!surveyModel) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const actionControls = (
    <>
      <button
        type="button"
        onClick={handleExportJson}
        disabled={!hasResponses}
        className={`rounded-md border px-3 py-1.5 text-sm font-medium transition-colors ${
          hasResponses
            ? "border-blue-600 text-blue-600 hover:bg-blue-50"
            : "border-blue-200 text-blue-300 cursor-not-allowed"
        }`}
      >
        Export JSON
      </button>
      <button
        type="button"
        onClick={handleExportCsv}
        disabled={!hasResponses}
        className={`rounded-md border px-3 py-1.5 text-sm font-medium transition-colors ${
          hasResponses
            ? "border-blue-600 text-blue-600 hover:bg-blue-50"
            : "border-blue-200 text-blue-300 cursor-not-allowed"
        }`}
      >
        Export CSV
      </button>
      <Link
        href="/survey/summary"
        className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
      >
        Review Summary
      </Link>
    </>
  );

  return (
    <div className="flex h-screen bg-gray-50">
      <SurveyNavigation
        sections={healthcareBenefitsSurvey.sections}
        currentSection={currentSection}
        onSectionChange={setCurrentSection}
        completedSections={completedSections}
      />

      <div className="flex-1 overflow-y-auto">
        <ProgressBar
          current={currentSection + 1}
          total={healthcareBenefitsSurvey.sections.length}
          sectionTitle={healthcareBenefitsSurvey.sections[currentSection].title}
          rightSlot={actionControls}
        />

        <div className="max-w-4xl mx-auto p-6">
          {isSaving && (
            <div className="mb-4 p-3 bg-blue-50 text-blue-700 rounded-lg flex items-center">
              <svg className="animate-spin h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Saving your responses...
            </div>
          )}

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <Survey model={surveyModel} />
          </div>
        </div>
      </div>
    </div>
  );
}

function debounce<T extends (...args: any[]) => void>(func: T, wait: number) {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return (...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout);
    }

    timeout = setTimeout(() => {
      func(...args);
    }, wait);
  };
}

const BuildingIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-1 4h1m-1 4h1M9 15h1m-1 4h1m4-4h1m-1 4h1" />
  </svg>
);

const HospitalIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M12 7v6m-3-3h6" />
  </svg>
);

const ToothIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2C10.3 2 9 3.3 9 5c0 1.7-1.3 3-3 3v2c2.8 0 5-2.2 5-5 0-.6.4-1 1-1s1 .4 1 1c0 2.8 2.2 5 5 5V8c-1.7 0-3-1.3-3-3 0-1.7-1.3-3-3-3z" />
  </svg>
);

const EyeIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);

const ShieldIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);

const PiggyBankIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
  </svg>
);

const CalendarIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const StrategyIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);

const ChevronRightIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
);

const DotIcon = () => (
  <svg className="w-2 h-2" fill="currentColor" viewBox="0 0 8 8">
    <circle cx="4" cy="4" r="3" />
  </svg>
);
