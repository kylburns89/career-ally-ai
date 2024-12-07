import Chat from '@/components/chat/chat'

export default function ChatPage() {
  const systemPrompt = 'You are a helpful career assistant, providing guidance on job searching, career development, and professional growth.'
  
  const initialMessage = `Hello! I'm your career AI assistant. I can help you with:
• Career planning and development
• Job search strategies
• Resume and cover letter advice
• Professional skill development
• Industry insights and trends

What would you like to discuss?`

  return (
    <div className="container mx-auto p-4">
      <Chat 
        systemPrompt={systemPrompt}
        initialMessage={initialMessage}
      />
    </div>
  )
}
