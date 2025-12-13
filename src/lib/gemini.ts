// 阿里通义 qwen-image-plus 图片生成 API

const DASHSCOPE_API_KEY = process.env.DASHSCOPE_API_KEY || '';
const BASE_URL = 'https://dashscope.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation';

interface GenerationResponse {
    request_id: string;
    output?: {
        choices?: Array<{
            message?: {
                content?: Array<{
                    image?: string;
                }>;
            };
        }>;
    };
    code?: string;
    message?: string;
}

export async function generateImage(prompt: string): Promise<{
    success: boolean;
    imageData?: string;
    error?: string;
}> {
    try {
        const response = await fetch(BASE_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${DASHSCOPE_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'qwen-image-plus',
                input: {
                    messages: [
                        {
                            role: 'user',
                            content: [
                                {
                                    type: 'text',
                                    text: prompt,
                                },
                            ],
                        },
                    ],
                },
                parameters: {
                    size: '1328*1328',
                },
            }),
        });

        const data: GenerationResponse = await response.json();

        if (data.code) {
            console.error('API 错误:', data.code, data.message);
            return { success: false, error: data.message || '生成失败' };
        }

        // 提取图片
        const choices = data.output?.choices;
        if (choices && choices.length > 0) {
            const content = choices[0].message?.content;
            if (content && content.length > 0) {
                for (const item of content) {
                    if (item.image) {
                        // 检查是 URL 还是 base64
                        if (item.image.startsWith('http')) {
                            // 是 URL，下载并转为 base64
                            const imgResponse = await fetch(item.image);
                            const buffer = await imgResponse.arrayBuffer();
                            const base64 = Buffer.from(buffer).toString('base64');
                            return {
                                success: true,
                                imageData: `data:image/png;base64,${base64}`,
                            };
                        } else if (item.image.startsWith('data:')) {
                            return { success: true, imageData: item.image };
                        } else {
                            return {
                                success: true,
                                imageData: `data:image/png;base64,${item.image}`,
                            };
                        }
                    }
                }
            }
        }

        return { success: false, error: '未生成图片' };
    } catch (error) {
        console.error('qwen-image-plus API 错误:', error);
        return { success: false, error: error instanceof Error ? error.message : '图片生成失败' };
    }
}
