// Grsai Nano Banana API Implementation
// Documentation: https://japi.grsai.com (Provided by user)

const API_KEY = process.env.DASHSCOPE_API_KEY || '';

// Host Configuration
const HOST_PROD = 'https://api.grsai.com'; // 根据网络抓包修正 Host
const BASE_URL = HOST_PROD;

interface CreateTaskResponse {
    code: number;
    msg: string;
    data?: {
        id?: string;
    };
    error?: string;
}

interface ResultResponse {
    code: number;
    msg: string;
    data?: {
        id: string;
        status: 'running' | 'succeeded' | 'failed';
        progress: number;
        results?: Array<{
            url: string;
            content: string;
        }>;
        failure_reason?: string;
        error?: string;
    };
}

export async function generateImage(prompt: string): Promise<{
    success: boolean;
    imageData?: string;
    error?: string;
}> {
    try {
        // 1. 创建任务 (Create Task)
        const createUrl = `${BASE_URL}/v1/draw/nano-banana`;
        console.log(`[NanoAPI] Creating task: ${createUrl}`);

        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${API_KEY}`,
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Origin': 'https://grsai.com', // 关键请求头
            'Referer': 'https://grsai.com/' // 关键请求头
        };

        const createRes = await fetch(createUrl, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify({
                model: 'nano-banana-fast',
                prompt: prompt,
                imageSize: '1K',
                aspectRatio: '1:1',
                webHook: '-1' // Enable polling mode
            })
        });

        if (!createRes.ok) {
            throw new Error(`Create task failed: ${createRes.status} ${createRes.statusText}`);
        }

        const createData: CreateTaskResponse = await createRes.json();

        if (createData.code !== 0 || !createData.data?.id) {
            console.error('[NanoAPI] Create error:', createData);
            return {
                success: false,
                error: createData.msg || createData.error || 'Failed to create task'
            };
        }

        const taskId = createData.data.id;
        console.log(`[NanoAPI] Task created. ID: ${taskId}`);

        // 2. 轮询结果 (Poll Result)
        const resultUrl = `${BASE_URL}/v1/draw/result`;
        const maxRetries = 30; // 30 * 2s = 60s timeout

        for (let i = 0; i < maxRetries; i++) {
            // Wait 2 seconds
            await new Promise(resolve => setTimeout(resolve, 2000));

            const resultRes = await fetch(resultUrl, {
                method: 'POST',
                headers: headers, // 复用 header
                body: JSON.stringify({ id: taskId })
            });

            if (!resultRes.ok) {
                console.warn(`[NanoAPI] Poll failed (attempt ${i + 1}): ${resultRes.status}`);
                continue;
            }

            const resultData: ResultResponse = await resultRes.json();

            if (resultData.code !== 0 || !resultData.data) {
                console.warn('[NanoAPI] Invalid poll response:', resultData);
                continue;
            }

            const { status, results, failure_reason, error } = resultData.data;
            console.log(`[NanoAPI] Status: ${status} (${resultData.data.progress}%)`);

            if (status === 'succeeded') {
                if (results && results.length > 0 && results[0].url) {
                    const imageUrl = results[0].url;

                    // Download and convert to base64
                    try {
                        const imgResponse = await fetch(imageUrl);
                        const buffer = await imgResponse.arrayBuffer();
                        const base64 = Buffer.from(buffer).toString('base64');
                        return {
                            success: true,
                            imageData: `data:image/png;base64,${base64}`
                        };
                    } catch (e) {
                        console.error('[NanoAPI] Image download failed:', e);
                        return { success: true, imageData: imageUrl };
                    }
                }
                return { success: false, error: 'Task succeeded but no image URL found' };
            }

            if (status === 'failed') {
                return {
                    success: false,
                    error: failure_reason || error || 'Generation failed'
                };
            }
        }

        return { success: false, error: 'Generation timed out' };

    } catch (error) {
        console.error('[NanoAPI] Error:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        };
    }
}
