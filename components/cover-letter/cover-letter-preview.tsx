"use client";

interface CoverLetterPreviewProps {
  content: string;
  template: string;
}

export function CoverLetterPreview({ content, template }: CoverLetterPreviewProps) {
  const paragraphs = content.split('\n').filter(p => p.trim());
  const date = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  switch (template) {
    case 'creative':
      return (
        <div className="bg-white min-h-[500px] w-full">
          {/* Blue accent header */}
          <div className="h-4 bg-blue-500 w-full mb-6" />
          
          <div className="px-8">
            {/* Modern date */}
            <div className="font-sans text-sm mb-6">{date}</div>
            
            {/* Content with left borders */}
            <div className="space-y-6">
              {paragraphs.map((paragraph, index) => (
                <div
                  key={index}
                  className="pl-4 border-l-2 border-blue-500 font-sans text-sm leading-relaxed"
                >
                  {paragraph}
                </div>
              ))}
            </div>
          </div>
        </div>
      );

    case 'technical':
      return (
        <div className="bg-white min-h-[500px] w-full p-8 font-mono text-sm">
          {/* Technical header */}
          <div className="bg-gray-100 p-3 mb-6">
            <div className="text-gray-600">
              // {new Date().toLocaleDateString('en-US', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
              })}
            </div>
          </div>
          
          {/* Content with code-style comments */}
          <div className="space-y-6">
            {paragraphs.map((paragraph, index) => (
              <div key={index}>
                {index === 0 && (
                  <div className="text-gray-600 mb-2">/* Introduction */</div>
                )}
                {index === paragraphs.length - 1 && (
                  <div className="text-gray-600 mb-2">/* Closing */</div>
                )}
                <div className="leading-relaxed">{paragraph}</div>
              </div>
            ))}
          </div>
        </div>
      );

    default: // Professional
      return (
        <div className="bg-white min-h-[500px] w-full p-8">
          {/* Traditional date */}
          <div className="font-serif text-sm mb-6">{date}</div>
          
          {/* Content with proper spacing */}
          <div className="space-y-6">
            {paragraphs.map((paragraph, index) => (
              <div
                key={index}
                className="font-serif text-sm leading-relaxed"
              >
                {paragraph}
              </div>
            ))}
          </div>
        </div>
      );
  }
}
