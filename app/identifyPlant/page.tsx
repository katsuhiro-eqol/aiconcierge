'use client';

import { useState } from 'react';

interface PlantIdentificationResponse {
  id: string;
  suggestions: Array<{
    id: string;
    plant_name: string;
    probability: number;
    plant_details: {
      common_names?: string[];
      family?: string;
      genus?: string;
    };
  }>;
  is_plant: boolean;
  is_plant_probability: number;
}

export default function PlantIdentifierTest() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PlantIdentificationResponse | null>(null);
  const [error, setError] = useState<string>('');

  const testIdentification = async () => {
    setLoading(true);
    setError('');
    setResult(null);

    try {
      // publicフォルダからテスト画像を取得
      const response = await fetch('/plant.jpg');
      if (!response.ok) {
        throw new Error('テスト画像の読み込みに失敗しました');
      }

      const blob = await response.blob();
      
      // BlobをBase64に変換
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onload = () => {
          const base64String = reader.result as string;
          resolve(base64String.split(',')[1]);
        };
        reader.onerror = () => reject(new Error('Base64変換に失敗しました'));
      });

      // APIを呼び出し
      const apiResponse = await fetch('/api/identifyPlant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imageBase64: base64 }),
      });

      if (!apiResponse.ok) {
        const errorData = await apiResponse.json();
        throw new Error(errorData.error || 'APIリクエストに失敗しました');
      }

      const data: PlantIdentificationResponse = await apiResponse.json();
      setResult(data);

    } catch (err) {
      console.error('Error:', err);
      setError(err instanceof Error ? err.message : '不明なエラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">PlantNet 植物判定テスト</h1>
      
      <div className="mb-6">
        <p className="text-sm text-gray-600 mb-4">
          テスト画像: public/plant.jpg を使用
        </p>
        <button
          onClick={testIdentification}
          disabled={loading}
          className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? '判定中...' : 'PlantNetで判定'}
        </button>
      </div>

      {error && (
        <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          <p className="font-semibold">エラー:</p>
          <p>{error}</p>
        </div>
      )}

      {result && (
        <div className="mt-6 p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4 text-green-800">判定結果</h2>
          
          <div className="mb-4 p-3 bg-blue-50 rounded">
            <p className="text-sm">
              <span className="font-semibold">植物である確率:</span>{' '}
              <span className="text-blue-700">{(result.is_plant_probability * 100).toFixed(1)}%</span>
            </p>
          </div>
          
          <div className="space-y-4">
            <h3 className="font-medium text-lg">候補:</h3>
            {result.suggestions.map((suggestion, index) => (
              <div key={suggestion.id} className="p-4 border border-gray-300 rounded-lg hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold text-lg text-gray-800">
                    {index + 1}. {suggestion.plant_name}
                  </h4>
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm font-medium">
                    {(suggestion.probability * 100).toFixed(1)}%
                  </span>
                </div>
                
                <div className="space-y-1 text-sm text-gray-600">
                  {suggestion.plant_details.common_names && suggestion.plant_details.common_names.length > 0 && (
                    <p>
                      <span className="font-medium">共通名:</span>{' '}
                      {suggestion.plant_details.common_names.join(', ')}
                    </p>
                  )}
                  {suggestion.plant_details.family && (
                    <p>
                      <span className="font-medium">科:</span> {suggestion.plant_details.family}
                    </p>
                  )}
                  {suggestion.plant_details.genus && (
                    <p>
                      <span className="font-medium">属:</span> {suggestion.plant_details.genus}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}