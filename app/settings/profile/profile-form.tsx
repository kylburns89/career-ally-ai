"use client"

import { useState } from 'react'
import { useProfile } from '../../../hooks/use-profile'
import { Card } from '../../../components/ui/card'
import { Input } from '../../../components/ui/input'
import { Label } from '../../../components/ui/label'
import { Button } from '../../../components/ui/button'
import { useToast } from '../../../hooks/use-toast'
import { Database } from '../../../types/database'

type Profile = Database['public']['Tables']['profiles']['Row']

export default function ProfileForm({ initialData }: { initialData: Profile }) {
  const { updateProfile } = useProfile()
  const { toast } = useToast()
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSaving(true)

    const formData = new FormData(e.currentTarget)
    const updates = {
      title: formData.get('title') as string,
      bio: formData.get('bio') as string,
      location: formData.get('location') as string,
      years_experience: parseInt(formData.get('years_experience') as string) || null,
      skills: (formData.get('skills') as string).split(',').map(s => s.trim()).filter(Boolean),
      industries: (formData.get('industries') as string).split(',').map(s => s.trim()).filter(Boolean),
      desired_salary: parseInt(formData.get('desired_salary') as string) || null,
      desired_location: formData.get('desired_location') as string,
      remote_only: formData.get('remote_only') === 'true',
      linkedin: formData.get('linkedin') as string,
      github: formData.get('github') as string,
      portfolio: formData.get('portfolio') as string,
    }

    const { error } = await updateProfile(updates)
    
    setSaving(false)
    
    if (error) {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      })
    } else {
      toast({
        title: "Success",
        description: "Profile updated successfully.",
      })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
        <div className="space-y-4">
          <div>
            <Label htmlFor="title">Professional Title</Label>
            <Input
              id="title"
              name="title"
              defaultValue={initialData.title || ''}
              placeholder="e.g. Senior Software Engineer"
            />
          </div>
          <div>
            <Label htmlFor="bio">Bio</Label>
            <textarea
              id="bio"
              name="bio"
              defaultValue={initialData.bio || ''}
              placeholder="Tell us about yourself..."
              className="w-full min-h-[100px] px-3 py-2 rounded-md border border-input bg-background"
            />
          </div>
          <div>
            <Label htmlFor="location">Current Location</Label>
            <Input
              id="location"
              name="location"
              defaultValue={initialData.location || ''}
              placeholder="e.g. San Francisco, CA"
            />
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Professional Details</h2>
        <div className="space-y-4">
          <div>
            <Label htmlFor="years_experience">Years of Experience</Label>
            <Input
              id="years_experience"
              name="years_experience"
              type="number"
              defaultValue={initialData.years_experience || ''}
              placeholder="e.g. 5"
            />
          </div>
          <div>
            <Label htmlFor="skills">Skills (comma-separated)</Label>
            <Input
              id="skills"
              name="skills"
              defaultValue={initialData.skills?.join(', ') || ''}
              placeholder="e.g. JavaScript, React, Node.js"
            />
          </div>
          <div>
            <Label htmlFor="industries">Industries (comma-separated)</Label>
            <Input
              id="industries"
              name="industries"
              defaultValue={initialData.industries?.join(', ') || ''}
              placeholder="e.g. Technology, Healthcare, Finance"
            />
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Career Preferences</h2>
        <div className="space-y-4">
          <div>
            <Label htmlFor="desired_salary">Desired Salary</Label>
            <Input
              id="desired_salary"
              name="desired_salary"
              type="number"
              defaultValue={initialData.desired_salary || ''}
              placeholder="e.g. 120000"
            />
          </div>
          <div>
            <Label htmlFor="desired_location">Desired Location</Label>
            <Input
              id="desired_location"
              name="desired_location"
              defaultValue={initialData.desired_location || ''}
              placeholder="e.g. New York, NY"
            />
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="remote_only"
              name="remote_only"
              value="true"
              defaultChecked={initialData.remote_only}
              className="h-4 w-4"
            />
            <Label htmlFor="remote_only">Remote Only</Label>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Social Links</h2>
        <div className="space-y-4">
          <div>
            <Label htmlFor="linkedin">LinkedIn Profile</Label>
            <Input
              id="linkedin"
              name="linkedin"
              type="url"
              defaultValue={initialData.linkedin || ''}
              placeholder="https://linkedin.com/in/yourprofile"
            />
          </div>
          <div>
            <Label htmlFor="github">GitHub Profile</Label>
            <Input
              id="github"
              name="github"
              type="url"
              defaultValue={initialData.github || ''}
              placeholder="https://github.com/yourusername"
            />
          </div>
          <div>
            <Label htmlFor="portfolio">Portfolio Website</Label>
            <Input
              id="portfolio"
              name="portfolio"
              type="url"
              defaultValue={initialData.portfolio || ''}
              placeholder="https://yourportfolio.com"
            />
          </div>
        </div>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" disabled={saving}>
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </form>
  )
}
