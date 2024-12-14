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
        <div className="bg-card min-h-[500px] w-full">
          {/* Accent header */}
          <div className="h-4 bg-primary w-full mb-6" />
          
          <div className="px-8">
            {/* Modern date */}
            <div className="font-sans text-sm text-muted-foreground mb-6">{date}</div>
            
            {/* Content with left borders */}
            <div className="space-y-6">
              {paragraphs.map((paragraph, index) => (
                <div
                  key={index}
                  className="pl-4 border-l-2 border-primary font-sans text-sm leading-relaxed text-foreground"
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
        <div className="bg-card min-h-[500px] w-full p-8 font-mono text-sm">
          <div className="bg-muted p-3 mb-6">
            <div className="text-muted-foreground">
              {`// ${new Date().toLocaleDateString('en-US', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
              })}`}
            </div>
          </div>
          
          <div className="space-y-6">
            {paragraphs.map((paragraph, index) => (
              <div key={index}>
                {index === 0 && (
                  <div className="text-muted-foreground mb-2">{"/* Introduction */"}</div>
                )}
                {index === paragraphs.length - 1 && (
                  <div className="text-muted-foreground mb-2">{"/* Closing */"}</div>
                )}
                <div className="leading-relaxed text-foreground">{paragraph}</div>
              </div>
            ))}
          </div>
        </div>
      );

    default: // Professional
      return (
        <div className="bg-card min-h-[500px] w-full p-8">
          {/* Traditional date */}
          <div className="font-serif text-sm text-muted-foreground mb-6">{date}</div>
          
          {/* Content with proper spacing */}
          <div className="space-y-6">
            {paragraphs.map((paragraph, index) => (
              <div
                key={index}
                className="font-serif text-sm leading-relaxed text-foreground"
              >
                {paragraph}
              </div>
            ))}
          </div>
        </div>
      );
  }
}
