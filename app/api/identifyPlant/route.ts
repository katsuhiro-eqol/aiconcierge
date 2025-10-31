import { NextRequest, NextResponse } from 'next/server';

interface PlantNetIdentificationRequest {
  imageBase64: string;
}

interface PlantNetResponse {
  results: Array<{
    score: number;
    species: {
      scientificName: string;
      commonNames?: string[];
      family?: {
        scientificName: string;
      };
      genus?: {
        scientificName: string;
      };
    };
    images?: Array<{
      url: string;
    }>;
  }>;
  // 必要に応じて他のフィールドを追加
}

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

// 日本語名を取得する別API（例）
const getJapaneseNameFromExternalAPI = async (scientificName: string): Promise<string> => {
    try {
      // Wikipedia APIや植物データベースから日本語名を取得
      const response = await fetch(
        `https://ja.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(scientificName)}`
      );
      if (response.ok) {
        const data = await response.json();
        // 日本語のタイトルから植物名を抽出するロジック
        return data.title;
      }
    } catch (error) {
      console.error('External API error:', error);
    }
    return scientificName; // 失敗時は学名を返す
};

export async function POST(request: NextRequest): Promise<NextResponse<PlantIdentificationResponse | { error: string }>> {
  try {
    const { imageBase64 }: PlantNetIdentificationRequest = await request.json();

    if (!imageBase64) {
      return NextResponse.json(
        { error: 'Image data is required' },
        { status: 400 }
      );
    }

    const API_KEY = process.env.PLANTNET_API_KEY || 'your-api-key-here';
    const API_URL = 'https://my-api.plantnet.org/v2/identify/all';

    // Base64をBlobに変換
    const binaryString = atob(imageBase64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    const blob = new Blob([bytes], { type: 'image/jpeg' });

    // FormDataを作成
    const formData = new FormData();
    formData.append('images', blob, 'plant.jpg');
    formData.append('organs', 'flower'); // flower, leaf, fruit, bark, etc.

    const response = await fetch(`${API_URL}?api-key=${API_KEY}`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`PlantNet API error: ${response.status}`);
    }

    const plantNetData: PlantNetResponse = await response.json();

    // PlantNetのレスポンスを共通フォーマットに変換
    const formattedResponse: PlantIdentificationResponse = {
      id: `plantnet-${Date.now()}`,
      suggestions: plantNetData.results.map((result, index) => ({
        id: `suggestion-${index}`,
        plant_name: result.species.scientificName,
        probability: result.score,
        plant_details: {
          common_names: result.species.commonNames,
          family: result.species.family?.scientificName,
          genus: result.species.genus?.scientificName,
        },
      })),
      is_plant: plantNetData.results.length > 0,
      is_plant_probability: plantNetData.results.length > 0 ? plantNetData.results[0].score : 0,
    };

    return NextResponse.json(formattedResponse);

  } catch (error: unknown) {
    console.error('Plant identification error:', error);
    
    // 開発環境ではモックデータを返す
    if (process.env.NODE_ENV === 'development') {
      const mockData: PlantIdentificationResponse = {
        id: 'dev-mock-' + Date.now(),
        suggestions: [
          {
            id: 'sug-1',
            plant_name: 'Rosa rubiginosa',
            probability: 0.85,
            plant_details: {
              common_names: ['スイートブライアー', 'エグランタインローズ'],
              family: 'Rosaceae',
              genus: 'Rosa',
            },
          },
          {
            id: 'sug-2',
            plant_name: 'Chrysanthemum morifolium',
            probability: 0.72,
            plant_details: {
              common_names: ['キク', '菊'],
              family: 'Asteraceae',
              genus: 'Chrysanthemum',
            },
          },
        ],
        is_plant: true,
        is_plant_probability: 0.95,
      };
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      return NextResponse.json(mockData);
    }

    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Internal server error'
      },
      { status: 500 }
    );
  }
}