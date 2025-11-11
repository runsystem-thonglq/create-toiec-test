"use client";
import TestRunner from "@/components/TestRunner";
import { TestManager } from "@/lib/testManager";
import { TestData } from "@/types";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

const DDetail = () => {
  const router = useRouter();
  const [selectedTest, setSelectedTest] = useState<TestData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const id = useParams().id;

  const handleBackToList = () => {
    router.push("/");
  };

  useEffect(() => {
    console.log("Fetching test with ID:", id);
    const fetchTest = async () => {
      const test = await TestManager.getTest(id as string);
      console.log(test, 4444);
      setSelectedTest(test);
      setIsLoading(false);
    };

    fetchTest();
  }, [id]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="card">
          <div className="bg-gradient-to-r from-slate-700 to-blue-600 text-white p-8 text-center">
            <h1 className="text-4xl font-bold mb-2">📝 TOEIC Test App</h1>
            <p className="text-lg opacity-90">
              Ứng dụng quản lý và thực hiện bài thi TOEIC
            </p>
          </div>
          {isLoading && !selectedTest ? (
            <div className="flex justify-center items-center h-64">
              <p className="text-white">Loading...</p>
            </div>
          ) : (
            <div>
              {selectedTest && (
                <div className="p-6">
                  <TestRunner test={selectedTest} onBack={handleBackToList} />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DDetail;
