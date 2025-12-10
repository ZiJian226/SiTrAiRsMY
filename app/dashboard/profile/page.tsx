'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Navbar from '@/components/Navbar'
import Container from '@/components/Container'
import Footer from '@/components/Footer'
import PageBackground from '@/components/PageBackground'
import Link from 'next/link'

export default function ProfileEditorPage() {
  const { user, profile, loading } = useAuth()
  const router = useRouter()
  
  // Common fields
  const [fullName, setFullName] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [bio, setBio] = useState('')
  
  // Talent-specific fields
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [youtubeUrl, setYoutubeUrl] = useState('')
  const [twitchUrl, setTwitchUrl] = useState('')
  const [tiktokUrl, setTiktokUrl] = useState('')
  const [lore, setLore] = useState('')
  const [dateOfBirth, setDateOfBirth] = useState('')
  const [debutDate, setDebutDate] = useState('')
  const [height, setHeight] = useState('')
  const [species, setSpecies] = useState('')
  const [likes, setLikes] = useState<string[]>([])
  const [dislikes, setDislikes] = useState<string[]>([])
  const [likesInput, setLikesInput] = useState('')
  const [dislikesInput, setDislikesInput] = useState('')
  
  // Artist-specific fields
  const [specialty, setSpecialty] = useState<string[]>([])
  const [specialtyInput, setSpecialtyInput] = useState('')
  const [portfolio, setPortfolio] = useState<string[]>([])
  const [portfolioInput, setPortfolioInput] = useState('')
  const [commissionsOpen, setCommissionsOpen] = useState(false)
  const [priceRange, setPriceRange] = useState('')
  const [contactEmail, setContactEmail] = useState('')
  const [websiteUrl, setWebsiteUrl] = useState('')
  const [twitterUrl, setTwitterUrl] = useState('')
  const [instagramUrl, setInstagramUrl] = useState('')
  
  // Visibility toggles
  const [showLore, setShowLore] = useState(true)
  const [showCharacterInfo, setShowCharacterInfo] = useState(true)
  const [showSocialLinks, setShowSocialLinks] = useState(true)
  const [showPortfolio, setShowPortfolio] = useState(true)
  
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '')
      setAvatarUrl(profile.avatar_url || '')
      setBio(profile.bio || '')
    }
  }, [profile])

  if (loading) {
    return (
      <div className="min-h-screen bg-base-100 flex items-center justify-center">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    )
  }

  if (!user || !profile) {
    return null
  }

  async function handleSave() {
    setSaving(true)
    setSuccess(false)

    // Simulate saving delay
    await new Promise(resolve => setTimeout(resolve, 800))

    // In mock mode, we just show success message
    // In real implementation, this would call: await supabase.from('profiles').update({...})
    
    setSaving(false)
    setSuccess(true)
    
    // Hide success message after 3 seconds
    setTimeout(() => setSuccess(false), 3000)
  }

  return (
    <div className="min-h-screen bg-base-100 relative flex flex-col">
      <PageBackground rotate={true} blur={true} opacity={50} />
      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar />
        <Container className="py-12 flex-grow">
          <div className="flex items-center justify-between mb-8">
            <Link href="/dashboard" className="btn btn-ghost btn-sm">
              ← Back to Dashboard
            </Link>
            <button
              onClick={handleSave}
              className="btn btn-primary btn-lg"
              disabled={saving}
            >
              {saving ? (
                <>
                  <span className="loading loading-spinner loading-sm"></span>
                  Saving...
                </>
              ) : (
                '💾 Save All Changes'
              )}
            </button>
          </div>

          <div className="mb-6">
            <h1 className="text-4xl font-bold text-primary mb-2">Edit Profile</h1>
            <p className="text-lg opacity-70">Preview and edit your public profile (matches public page layout)</p>
          </div>

          {success && (
            <div className="alert alert-success mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Profile updated successfully!</span>
            </div>
          )}

          {/* Profile Header Card */}
          <div className="card bg-base-200 shadow-xl mb-8">
            <div className="card-body">
              <h2 className="card-title text-2xl mb-4">Profile Header</h2>
              
              <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
                {/* Avatar Preview */}
                <div className="avatar">
                  <div className={`w-48 rounded-full ring ${profile.role === 'artist' ? 'ring-secondary' : 'ring-primary'} ring-offset-base-100 ring-offset-4`}>
                    <img 
                      src={avatarUrl || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'} 
                      alt="Avatar preview"
                      onError={(e) => {
                        e.currentTarget.src = 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'
                      }}
                    />
                  </div>
                </div>

                {/* Profile Fields */}
                <div className="flex-1 w-full space-y-4">
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-semibold">Display Name</span>
                    </label>
                    <input
                      type="text"
                      className="input input-bordered input-lg"
                      placeholder="Your name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      disabled={saving}
                    />
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-semibold">Avatar URL</span>
                    </label>
                    <input
                      type="url"
                      className="input input-bordered"
                      placeholder="https://example.com/avatar.jpg"
                      value={avatarUrl}
                      onChange={(e) => setAvatarUrl(e.target.value)}
                      disabled={saving}
                    />
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-semibold">Short Bio</span>
                      <span className="label-text-alt">{bio.length}/200</span>
                    </label>
                    <textarea
                      className="textarea textarea-bordered h-24"
                      placeholder="Short description about yourself..."
                      value={bio}
                      onChange={(e) => setBio(e.target.value.slice(0, 200))}
                      disabled={saving}
                      maxLength={200}
                    />
                  </div>

                  {/* Talent: Tags */}
                  {profile.role === 'talent' && (
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text font-semibold">Tags</span>
                      </label>
                      <div className="join w-full">
                        <input
                          type="text"
                          className="input input-bordered join-item flex-1"
                          placeholder="Add a tag and press Enter"
                          value={tagInput}
                          onChange={(e) => setTagInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault()
                              if (tagInput.trim()) {
                                setTags([...tags, tagInput.trim()])
                                setTagInput('')
                              }
                            }
                          }}
                          disabled={saving}
                        />
                        <button
                          type="button"
                          className="btn btn-secondary join-item"
                          onClick={() => {
                            if (tagInput.trim()) {
                              setTags([...tags, tagInput.trim()])
                              setTagInput('')
                            }
                          }}
                          disabled={saving}
                        >
                          Add
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {tags.map((tag, idx) => (
                          <div key={idx} className="badge badge-secondary badge-lg gap-2">
                            {tag}
                            <button
                              type="button"
                              className="btn btn-ghost btn-xs btn-circle"
                              onClick={() => setTags(tags.filter((_, i) => i !== idx))}
                              disabled={saving}
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Artist: Specialty */}
                  {profile.role === 'artist' && (
                    <>
                      <div className="form-control">
                        <label className="label">
                          <span className="label-text font-semibold">Specialty Tags</span>
                        </label>
                        <div className="join w-full">
                          <input
                            type="text"
                            className="input input-bordered join-item flex-1"
                            placeholder="Add specialty and press Enter"
                            value={specialtyInput}
                            onChange={(e) => setSpecialtyInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault()
                                if (specialtyInput.trim()) {
                                  setSpecialty([...specialty, specialtyInput.trim()])
                                  setSpecialtyInput('')
                                }
                              }
                            }}
                            disabled={saving}
                          />
                          <button
                            type="button"
                            className="btn btn-accent join-item"
                            onClick={() => {
                              if (specialtyInput.trim()) {
                                setSpecialty([...specialty, specialtyInput.trim()])
                                setSpecialtyInput('')
                              }
                            }}
                            disabled={saving}
                          >
                            Add
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {specialty.map((spec, idx) => (
                            <div key={idx} className="badge badge-accent badge-lg gap-2">
                              {spec}
                              <button
                                type="button"
                                className="btn btn-ghost btn-xs btn-circle"
                                onClick={() => setSpecialty(specialty.filter((_, i) => i !== idx))}
                                disabled={saving}
                              >
                                ✕
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="form-control">
                          <label className="label">
                            <span className="label-text font-semibold">Price Range</span>
                          </label>
                          <input
                            type="text"
                            className="input input-bordered"
                            placeholder="e.g., $100 - $500"
                            value={priceRange}
                            onChange={(e) => setPriceRange(e.target.value)}
                            disabled={saving}
                          />
                        </div>

                        <div className="form-control">
                          <label className="label cursor-pointer justify-start gap-3">
                            <input
                              type="checkbox"
                              className="toggle toggle-success toggle-lg"
                              checked={commissionsOpen}
                              onChange={(e) => setCommissionsOpen(e.target.checked)}
                              disabled={saving}
                            />
                            <span className="label-text font-semibold">
                              {commissionsOpen ? 'Open for Commissions' : 'Commissions Closed'}
                            </span>
                          </label>
                        </div>
                      </div>

                      <div className="form-control">
                        <label className="label">
                          <span className="label-text font-semibold">Contact Email</span>
                        </label>
                        <input
                          type="email"
                          className="input input-bordered"
                          placeholder="contact@example.com"
                          value={contactEmail}
                          onChange={(e) => setContactEmail(e.target.value)}
                          disabled={saving}
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Talent: Social Links */}
          {profile.role === 'talent' && (
            <div className="card bg-base-200 shadow-xl mb-8">
              <div className="card-body">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="card-title text-2xl">Social Links</h2>
                  <label className="label cursor-pointer gap-3">
                    <span className="label-text">Show on profile</span>
                    <input
                      type="checkbox"
                      className="toggle toggle-primary"
                      checked={showSocialLinks}
                      onChange={(e) => setShowSocialLinks(e.target.checked)}
                    />
                  </label>
                </div>

                {showSocialLinks && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text font-semibold">🎥 YouTube URL</span>
                      </label>
                      <input
                        type="url"
                        className="input input-bordered"
                        placeholder="https://youtube.com/@yourname"
                        value={youtubeUrl}
                        onChange={(e) => setYoutubeUrl(e.target.value)}
                        disabled={saving}
                      />
                    </div>

                    <div className="form-control">
                      <label className="label">
                        <span className="label-text font-semibold">🎮 Twitch URL</span>
                      </label>
                      <input
                        type="url"
                        className="input input-bordered"
                        placeholder="https://twitch.tv/yourname"
                        value={twitchUrl}
                        onChange={(e) => setTwitchUrl(e.target.value)}
                        disabled={saving}
                      />
                    </div>

                    <div className="form-control">
                      <label className="label">
                        <span className="label-text font-semibold">🎵 TikTok URL</span>
                      </label>
                      <input
                        type="url"
                        className="input input-bordered"
                        placeholder="https://tiktok.com/@yourname"
                        value={tiktokUrl}
                        onChange={(e) => setTiktokUrl(e.target.value)}
                        disabled={saving}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Artist: Social Links */}
          {profile.role === 'artist' && (
            <div className="card bg-base-200 shadow-xl mb-8">
              <div className="card-body">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="card-title text-2xl">Social Links</h2>
                  <label className="label cursor-pointer gap-3">
                    <span className="label-text">Show on profile</span>
                    <input
                      type="checkbox"
                      className="toggle toggle-secondary"
                      checked={showSocialLinks}
                      onChange={(e) => setShowSocialLinks(e.target.checked)}
                    />
                  </label>
                </div>

                {showSocialLinks && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text font-semibold">🌐 Website URL</span>
                      </label>
                      <input
                        type="url"
                        className="input input-bordered"
                        placeholder="https://yourwebsite.com"
                        value={websiteUrl}
                        onChange={(e) => setWebsiteUrl(e.target.value)}
                        disabled={saving}
                      />
                    </div>

                    <div className="form-control">
                      <label className="label">
                        <span className="label-text font-semibold">🐦 Twitter URL</span>
                      </label>
                      <input
                        type="url"
                        className="input input-bordered"
                        placeholder="https://twitter.com/yourname"
                        value={twitterUrl}
                        onChange={(e) => setTwitterUrl(e.target.value)}
                        disabled={saving}
                      />
                    </div>

                    <div className="form-control">
                      <label className="label">
                        <span className="label-text font-semibold">📷 Instagram URL</span>
                      </label>
                      <input
                        type="url"
                        className="input input-bordered"
                        placeholder="https://instagram.com/yourname"
                        value={instagramUrl}
                        onChange={(e) => setInstagramUrl(e.target.value)}
                        disabled={saving}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Talent: Lore Section */}
          {profile.role === 'talent' && (
            <div className="card bg-base-200 shadow-xl mb-8">
              <div className="card-body">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="card-title text-2xl">📖 Introduction / Lore</h2>
                  <label className="label cursor-pointer gap-3">
                    <span className="label-text">Show on profile</span>
                    <input
                      type="checkbox"
                      className="toggle toggle-primary"
                      checked={showLore}
                      onChange={(e) => setShowLore(e.target.checked)}
                    />
                  </label>
                </div>

                {showLore && (
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-semibold">Character Backstory</span>
                      <span className="label-text-alt">{lore.length}/1000</span>
                    </label>
                    <textarea
                      className="textarea textarea-bordered h-40"
                      placeholder="Your character's backstory, lore, or detailed introduction..."
                      value={lore}
                      onChange={(e) => setLore(e.target.value.slice(0, 1000))}
                      disabled={saving}
                      maxLength={1000}
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Talent: Character Info */}
          {profile.role === 'talent' && (
            <div className="card bg-base-200 shadow-xl mb-8">
              <div className="card-body">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="card-title text-2xl">ℹ️ Character Info</h2>
                  <label className="label cursor-pointer gap-3">
                    <span className="label-text">Show on profile</span>
                    <input
                      type="checkbox"
                      className="toggle toggle-primary"
                      checked={showCharacterInfo}
                      onChange={(e) => setShowCharacterInfo(e.target.checked)}
                    />
                  </label>
                </div>

                {showCharacterInfo && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="form-control">
                        <label className="label">
                          <span className="label-text font-semibold">Date of Birth</span>
                        </label>
                        <input
                          type="text"
                          className="input input-bordered"
                          placeholder="e.g., December 25"
                          value={dateOfBirth}
                          onChange={(e) => setDateOfBirth(e.target.value)}
                          disabled={saving}
                        />
                      </div>

                      <div className="form-control">
                        <label className="label">
                          <span className="label-text font-semibold">Debut Date</span>
                        </label>
                        <input
                          type="text"
                          className="input input-bordered"
                          placeholder="e.g., January 15, 2023"
                          value={debutDate}
                          onChange={(e) => setDebutDate(e.target.value)}
                          disabled={saving}
                        />
                      </div>

                      <div className="form-control">
                        <label className="label">
                          <span className="label-text font-semibold">Height</span>
                        </label>
                        <input
                          type="text"
                          className="input input-bordered"
                          placeholder="e.g., 158 cm"
                          value={height}
                          onChange={(e) => setHeight(e.target.value)}
                          disabled={saving}
                        />
                      </div>

                      <div className="form-control">
                        <label className="label">
                          <span className="label-text font-semibold">Species</span>
                        </label>
                        <input
                          type="text"
                          className="input input-bordered"
                          placeholder="e.g., Star Spirit, Cat, Dragon"
                          value={species}
                          onChange={(e) => setSpecies(e.target.value)}
                          disabled={saving}
                        />
                      </div>
                    </div>

                    <div className="form-control">
                      <label className="label">
                        <span className="label-text font-semibold">Likes</span>
                      </label>
                      <div className="join w-full">
                        <input
                          type="text"
                          className="input input-bordered join-item flex-1"
                          placeholder="Add a like and press Enter"
                          value={likesInput}
                          onChange={(e) => setLikesInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault()
                              if (likesInput.trim()) {
                                setLikes([...likes, likesInput.trim()])
                                setLikesInput('')
                              }
                            }
                          }}
                          disabled={saving}
                        />
                        <button
                          type="button"
                          className="btn btn-success join-item"
                          onClick={() => {
                            if (likesInput.trim()) {
                              setLikes([...likes, likesInput.trim()])
                              setLikesInput('')
                            }
                          }}
                          disabled={saving}
                        >
                          Add
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {likes.map((like, idx) => (
                          <div key={idx} className="badge badge-success badge-lg gap-2">
                            ❤️ {like}
                            <button
                              type="button"
                              className="btn btn-ghost btn-xs btn-circle"
                              onClick={() => setLikes(likes.filter((_, i) => i !== idx))}
                              disabled={saving}
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="form-control">
                      <label className="label">
                        <span className="label-text font-semibold">Dislikes</span>
                      </label>
                      <div className="join w-full">
                        <input
                          type="text"
                          className="input input-bordered join-item flex-1"
                          placeholder="Add a dislike and press Enter"
                          value={dislikesInput}
                          onChange={(e) => setDislikesInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault()
                              if (dislikesInput.trim()) {
                                setDislikes([...dislikes, dislikesInput.trim()])
                                setDislikesInput('')
                              }
                            }
                          }}
                          disabled={saving}
                        />
                        <button
                          type="button"
                          className="btn btn-error join-item"
                          onClick={() => {
                            if (dislikesInput.trim()) {
                              setDislikes([...dislikes, dislikesInput.trim()])
                              setDislikesInput('')
                            }
                          }}
                          disabled={saving}
                        >
                          Add
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {dislikes.map((dislike, idx) => (
                          <div key={idx} className="badge badge-error badge-lg gap-2">
                            💔 {dislike}
                            <button
                              type="button"
                              className="btn btn-ghost btn-xs btn-circle"
                              onClick={() => setDislikes(dislikes.filter((_, i) => i !== idx))}
                              disabled={saving}
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Artist: Portfolio */}
          {profile.role === 'artist' && (
            <div className="card bg-base-200 shadow-xl mb-8">
              <div className="card-body">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="card-title text-2xl">🖼️ Portfolio</h2>
                  <label className="label cursor-pointer gap-3">
                    <span className="label-text">Show on profile</span>
                    <input
                      type="checkbox"
                      className="toggle toggle-secondary"
                      checked={showPortfolio}
                      onChange={(e) => setShowPortfolio(e.target.checked)}
                    />
                  </label>
                </div>

                {showPortfolio && (
                  <>
                    <div className="form-control mb-4">
                      <label className="label">
                        <span className="label-text font-semibold">Add Portfolio Image URL</span>
                      </label>
                      <div className="join w-full">
                        <input
                          type="url"
                          className="input input-bordered join-item flex-1"
                          placeholder="https://example.com/artwork.jpg"
                          value={portfolioInput}
                          onChange={(e) => setPortfolioInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault()
                              if (portfolioInput.trim()) {
                                setPortfolio([...portfolio, portfolioInput.trim()])
                                setPortfolioInput('')
                              }
                            }
                          }}
                          disabled={saving}
                        />
                        <button
                          type="button"
                          className="btn btn-secondary join-item"
                          onClick={() => {
                            if (portfolioInput.trim()) {
                              setPortfolio([...portfolio, portfolioInput.trim()])
                              setPortfolioInput('')
                            }
                          }}
                          disabled={saving}
                        >
                          Add Image
                        </button>
                      </div>
                    </div>

                    {portfolio.length > 0 && (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {portfolio.map((image, idx) => (
                          <div key={idx} className="relative aspect-[3/4] overflow-hidden rounded-lg group">
                            <img
                              src={image}
                              alt={`Portfolio ${idx + 1}`}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.src = 'https://placehold.co/600x800/8b5cf6/ffffff?text=Image+' + (idx + 1)
                              }}
                            />
                            <button
                              type="button"
                              className="btn btn-error btn-sm btn-circle absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => setPortfolio(portfolio.filter((_, i) => i !== idx))}
                              disabled={saving}
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {portfolio.length === 0 && (
                      <div className="alert alert-info">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        <span>Add images to showcase your portfolio</span>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}

          {/* Account Info (always visible) */}
          <div className="alert alert-info">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <div>
              <div className="font-semibold">Account: {profile.role} • {profile.email}</div>
              <div className="text-sm opacity-70 mt-1">
                ⚠️ Mock Mode: Changes won't persist after refresh
              </div>
            </div>
          </div>
        </Container>
        <Footer />
      </div>
    </div>
  )
}
