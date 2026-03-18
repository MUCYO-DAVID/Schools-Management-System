'use client'

import React, { useState } from 'react'
import { Moon, Sun, Globe, Shield, Database } from 'lucide-react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Tabs from '@/components/dashboard/Tabs'

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('general')
  const [theme, setTheme] = useState<'light' | 'dark' | 'auto'>('auto')
  const [language, setLanguage] = useState('en')

  const tabs = [
    { id: 'general', label: 'General' },
    { id: 'appearance', label: 'Appearance' },
    { id: 'privacy', label: 'Privacy & Security' },
    { id: 'data', label: 'Data Management' },
  ]

  return (
    <DashboardLayout>
      <div className="container-responsive py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground mt-1">Manage your preferences and account settings</p>
        </div>

        {/* Tabs */}
        <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} variant="default" />

        {/* Content */}
        <div className="space-y-6">
          {/* General Settings */}
          {activeTab === 'general' && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Language & Region</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Language
                    </label>
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="w-full px-3 py-2 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="en">English</option>
                      <option value="fr">Français</option>
                      <option value="rw">Kinyarwanda</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Timezone
                    </label>
                    <select className="w-full px-3 py-2 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary">
                      <option value="UTC+2">UTC+2 (East Africa Time)</option>
                      <option value="UTC+1">UTC+1 (West Africa Time)</option>
                      <option value="UTC">UTC</option>
                    </select>
                  </div>
                  <Button variant="primary" size="md">
                    Save Changes
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Email Preferences</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { label: 'Receive email notifications', description: 'Get notified about important updates' },
                    { label: 'Marketing emails', description: 'Receive promotional and feature updates' },
                    { label: 'Weekly digest', description: 'Receive a summary of your activities' },
                  ].map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div>
                        <p className="font-medium text-foreground text-sm">{item.label}</p>
                        <p className="text-xs text-muted-foreground mt-1">{item.description}</p>
                      </div>
                      <input
                        type="checkbox"
                        defaultChecked={index < 2}
                        className="w-5 h-5 rounded border-border cursor-pointer"
                      />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </>
          )}

          {/* Appearance Settings */}
          {activeTab === 'appearance' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Moon className="w-5 h-5" />
                  Theme
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {[
                    { value: 'light', label: 'Light', icon: Sun },
                    { value: 'dark', label: 'Dark', icon: Moon },
                    { value: 'auto', label: 'Auto', icon: Globe },
                  ].map((option) => (
                    <label
                      key={option.value}
                      className={`flex items-center p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                        theme === option.value
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="theme"
                        value={option.value}
                        checked={theme === option.value}
                        onChange={(e) => setTheme(e.target.value as typeof theme)}
                        className="w-4 h-4"
                      />
                      <option.icon className="w-5 h-5 ml-3 text-muted-foreground" />
                      <span className="ml-2 font-medium text-foreground">{option.label}</span>
                    </label>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Privacy & Security */}
          {activeTab === 'privacy' && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Privacy Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { label: 'Public profile', description: 'Allow others to see your profile' },
                    { label: 'Show activity status', description: 'Let others know when you are online' },
                    { label: 'Search engine indexing', description: 'Allow Google and other search engines to index your profile' },
                  ].map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div>
                        <p className="font-medium text-foreground text-sm">{item.label}</p>
                        <p className="text-xs text-muted-foreground mt-1">{item.description}</p>
                      </div>
                      <input
                        type="checkbox"
                        defaultChecked={index === 0}
                        className="w-5 h-5 rounded border-border cursor-pointer"
                      />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </>
          )}

          {/* Data Management */}
          {activeTab === 'data' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="w-5 h-5" />
                  Data Management
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-900">
                    Download or delete your personal data. This action cannot be undone.
                  </p>
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" size="md">
                    Download My Data
                  </Button>
                  <Button variant="destructive" size="md">
                    Delete Account
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
