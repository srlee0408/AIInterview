import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.REACT_APP_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

export const ASSISTANT_ID = process.env.REACT_APP_GPT_ASSISTANT_ID;

export const createThread = async () => {
  try {
    const thread = await openai.beta.threads.create();
    return thread;
  } catch (error) {
    console.error('Error creating thread:', error);
    throw new Error('면접 세션 생성에 실패했습니다.');
  }
};

export const addMessage = async (threadId: string, content: string) => {
  try {
    const message = await openai.beta.threads.messages.create(threadId, {
      role: 'user',
      content: content,
    });
    return message;
  } catch (error) {
    console.error('Error adding message:', error);
    throw new Error('메시지 전송에 실패했습니다.');
  }
};

export const runAssistant = async (threadId: string) => {
  try {
    const run = await openai.beta.threads.runs.create(threadId, {
      assistant_id: ASSISTANT_ID!,
    });
    return run;
  } catch (error) {
    console.error('Error running assistant:', error);
    throw new Error('AI 면접관 실행에 실패했습니다.');
  }
};

export const getResponse = async (threadId: string, runId: string) => {
  try {
    let run = await openai.beta.threads.runs.retrieve(threadId, runId);
    
    while (run.status === 'in_progress' || run.status === 'queued') {
      await new Promise(resolve => setTimeout(resolve, 1000));
      run = await openai.beta.threads.runs.retrieve(threadId, runId);
    }

    if (run.status === 'completed') {
      const messages = await openai.beta.threads.messages.list(threadId);
      const content = messages.data[0].content[0];
      
      if (content.type === 'text') {
        return content.text.value;
      } else {
        throw new Error('예상치 못한 응답 형식입니다.');
      }
    } else {
      throw new Error('응답 생성에 실패했습니다.');
    }
  } catch (error) {
    console.error('Error getting response:', error);
    throw new Error('AI 응답을 가져오는데 실패했습니다.');
  }
}; 