import { CoverLetterGenerator } from "@/components/cover-letter/cover-letter-generator";

export default function CoverLetterPage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-4xl font-bold mb-8">Cover Letter Generator</h1>
      <CoverLetterGenerator />
    </div>
  )
}
