'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import Navbar from '@/components/Navbar'
import Container from '@/components/Container'
import Footer from '@/components/Footer'
import PageBackground from '@/components/PageBackground'
import Link from 'next/link'

type ProfileImage = { url: string; object_key?: string }

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
  const [instagramUrl, setInstagramUrl] = useState('')
  const [xUrl, setXUrl] = useState('')
  const [featuredVideoUrl, setFeaturedVideoUrl] = useState('')
  const [vtuberModelUrl, setVtuberModelUrl] = useState('')
  const [fullBodyModelUrl, setFullBodyModelUrl] = useState('')
  const [portraitPictureInput, setPortraitPictureInput] = useState('')
  const [portraitPictures, setPortraitPictures] = useState<ProfileImage[]>([])
  const [portraitSizeHint, setPortraitSizeHint] = useState<{ width: number; height: number; recommendedWidth: number; recommendedHeight: number } | null>(null)
  const [portraitImageSize, setPortraitImageSize] = useState<{ width: number; height: number } | null>(null)
  const [portraitSectionElement, setPortraitSectionElement] = useState<HTMLDivElement | null>(null)
  const [profileCardUrl, setProfileCardUrl] = useState('')
  const [supportUrl, setSupportUrl] = useState('')
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
  const [portfolioArt, setPortfolioArt] = useState<string[]>([])
  const [portfolioArtInput, setPortfolioArtInput] = useState('')
  const [portfolioArtImages, setPortfolioArtImages] = useState<ProfileImage[]>([])
  const [commissionsOpen, setCommissionsOpen] = useState(false)
  const [priceRange, setPriceRange] = useState('')
  const [contactEmail, setContactEmail] = useState('')
  const [websiteUrl, setWebsiteUrl] = useState('')
  const [twitterUrl, setTwitterUrl] = useState('')
  
  // Visibility toggles
  const [showCharacterInfo, setShowCharacterInfo] = useState(true)
  const [showSocialLinks, setShowSocialLinks] = useState(true)
  const [showPortfolio, setShowPortfolio] = useState(true)
  
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [imageUploading, setImageUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  useEffect(() => {
    if (user && profile && !saving) {
      loadProfileData()
    }
  }, [user, profile, saving])

  useEffect(() => {
    const sourceUrl = portraitPictureInput.trim() || portraitPictures[0]?.url || fullBodyModelUrl.trim()

    if (!sourceUrl) {
      setPortraitImageSize(null)
      setPortraitSizeHint(null)
      return
    }

    let cancelled = false
    const image = new window.Image()

    image.onload = () => {
      if (cancelled) return

      const width = image.naturalWidth
      const height = image.naturalHeight

      if (!width || !height) {
        setPortraitImageSize(null)
        setPortraitSizeHint(null)
        return
      }

      setPortraitImageSize({
        width,
        height,
      })
    }

    image.onerror = () => {
      if (!cancelled) {
        setPortraitImageSize(null)
        setPortraitSizeHint(null)
      }
    }

    image.src = sourceUrl

    return () => {
      cancelled = true
    }
  }, [portraitPictureInput, portraitPictures, fullBodyModelUrl])

  useEffect(() => {
    if (!portraitSectionElement || typeof ResizeObserver === 'undefined') {
      return
    }

    const updateSectionSize = () => {
      const rect = portraitSectionElement.getBoundingClientRect()

      if (rect.width > 0 && rect.height > 0) {
        const width = Math.round(rect.width)
        const height = Math.round(rect.height)
        setPortraitSizeHint((current) => {
          if (current && current.recommendedWidth === width && current.recommendedHeight === height) {
            return current
          }

          if (!portraitImageSize) {
            return null
          }

          return {
            width: portraitImageSize.width,
            height: portraitImageSize.height,
            recommendedWidth: width,
            recommendedHeight: height,
          }
        })
      }
    }

    updateSectionSize()

    const observer = new ResizeObserver(updateSectionSize)
    observer.observe(portraitSectionElement)

    return () => {
      observer.disconnect()
    }
  }, [portraitSectionElement, portraitImageSize])

  useEffect(() => {
    if (!portraitImageSize || !portraitSizeHint) {
      return
    }

    setPortraitSizeHint({
      width: portraitImageSize.width,
      height: portraitImageSize.height,
      recommendedWidth: portraitSizeHint.recommendedWidth,
      recommendedHeight: portraitSizeHint.recommendedHeight,
    })
  }, [portraitImageSize, portraitSizeHint?.recommendedWidth, portraitSizeHint?.recommendedHeight])

  const setPortraitSectionRef = useCallback((node: HTMLDivElement | null) => {
    setPortraitSectionElement(node)
  }, [])

  // Convert incoming date-like strings to HTML date input value (YYYY-MM-DD)
  function toDateInputValue(value?: string) {
    if (!value) return ''
    const d = new Date(value)
    if (isNaN(d.getTime())) return ''
    return d.toISOString().slice(0, 10)
  }

  async function loadProfileData() {
    try {
      const response = await fetch('/api/dashboard/profile', {
        cache: 'no-store',
        headers: {
          'x-user-id': user!.id
        }
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('Profile fetch failed:', response.status, errorData)
        setFullName(profile?.full_name || '')
        setAvatarUrl(profile?.avatar_url || '')
        setBio(profile?.bio || '')
        return
      }

      const data = await response.json() as {
        stage_name?: string
        full_name?: string
        avatar_url?: string
        bio?: string
        character_description?: string
        date_of_birth?: string
        debut_date?: string
        height?: string
        species?: string
        tags?: string[]
        likes?: string[]
        dislikes?: string[]
        portfolio_links?: string[]
        portfolio_art?: string[]
        vtuber_model_url?: string | null
        profile_picture_url?: string | null
        portrait_picture_url?: string | null
        portrait_pictures?: ProfileImage[]
        featured_video_url?: string | null
        profile_card_url?: string | null
        social_links?: {
          youtube?: string | null
          youtubeUrl?: string | null
          twitch?: string | null
          twitchUrl?: string | null
          tiktok?: string | null
          tiktokUrl?: string | null
          instagram?: string | null
          instagramUrl?: string | null
          x?: string | null
          xUrl?: string | null
          twitter?: string | null
          twitterUrl?: string | null
        }
        specialty?: string[]
        portfolio_art_images?: ProfileImage[]
        commissions_open?: boolean
        price_range?: string | null
        contact_email?: string | null
        social_media_links?: {
          website?: string | null
          twitter?: string | null
          x?: string | null
          instagram?: string | null
        }
      }

      console.log('Loaded profile data:', { role: profile?.role, data })

      setAvatarUrl(data.avatar_url || profile?.avatar_url || '')

      if (profile?.role === 'artist') {
        const socialLinks = data.social_media_links || {}
        setFullName(data.full_name || profile?.full_name || '')
        setBio(data.bio || profile?.bio || '')
        setFeaturedVideoUrl('')
        setSpecialty(data.specialty || [])
        setPortfolio(data.portfolio_links || [])
        setPortfolioArt(data.portfolio_art || [])
        setPortfolioArtImages(data.portfolio_art_images || [])
        setCommissionsOpen(Boolean(data.commissions_open))
        setPriceRange(data.price_range || '')
        setContactEmail(data.contact_email || '')
        setWebsiteUrl(socialLinks.website || '')
        setTwitterUrl(socialLinks.x || socialLinks.twitter || '')
        setInstagramUrl(socialLinks.instagram || '')
      } else {
        const socialLinks = data.social_links || {}
        setFullName(data.stage_name || profile?.full_name || '')
        setBio(data.bio || data.character_description || profile?.bio || '')
        setDateOfBirth(toDateInputValue(data.date_of_birth || ''))
        setDebutDate(toDateInputValue(data.debut_date || ''))
        setHeight(data.height || '')
        setSpecies(data.species || '')
        setTags(data.tags || [])
        setYoutubeUrl(socialLinks.youtube || socialLinks.youtubeUrl || '')
        setTwitchUrl(socialLinks.twitch || socialLinks.twitchUrl || '')
        setTiktokUrl(socialLinks.tiktok || socialLinks.tiktokUrl || '')
        setInstagramUrl(socialLinks.instagram || socialLinks.instagramUrl || '')
        setXUrl(socialLinks.x || socialLinks.xUrl || socialLinks.twitter || socialLinks.twitterUrl || '')
        setFeaturedVideoUrl(data.featured_video_url || '')
        setLikes(data.likes || [])
        setDislikes(data.dislikes || [])
        setPortfolio(data.portfolio_links || [])
        setVtuberModelUrl(data.vtuber_model_url || '')
        const nextPortraitPictures = data.portrait_pictures && data.portrait_pictures.length > 0
          ? data.portrait_pictures
          : data.portrait_picture_url
            ? [{ url: data.portrait_picture_url }]
            : []
        setPortraitPictures(nextPortraitPictures)
        setFullBodyModelUrl(nextPortraitPictures[0]?.url || data.portrait_picture_url || '')
        setProfileCardUrl((data as any).profile_card_url || '')
        setSupportUrl((data as any).support_url || '')
      }
    } catch (err) {
      console.error('Failed to load profile:', err)
    }
  }

  async function handleAvatarFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    setImageUploading(true)
    setUploadError(null)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('folder', 'users/avatars')

      const response = await fetch('/api/admin/uploads/image', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        setUploadError('Failed to upload image')
        return
      }

      const { url, key } = await response.json()
      setAvatarUrl(url)
    } catch (err) {
      console.error('Upload error:', err)
      setUploadError('Error uploading image')
    } finally {
      setImageUploading(false)
    }
  }

  function syncPortraitPictures(nextPictures: ProfileImage[]) {
    setPortraitPictures(nextPictures)
    setFullBodyModelUrl(nextPictures[0]?.url || '')
  }

  function handleAddPortraitPictureUrl() {
    const url = portraitPictureInput.trim()
    if (!url) {
      return
    }

    syncPortraitPictures([...portraitPictures, { url }])
    setPortraitPictureInput('')
  }

  function handleRemovePortraitPicture(idx: number) {
    syncPortraitPictures(portraitPictures.filter((_, i) => i !== idx))
  }

  async function handlePictureUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files || [])
    if (files.length === 0) return

    setImageUploading(true)
    setUploadError(null)

    try {
      const uploadedPictures: ProfileImage[] = []

      for (const file of files) {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('folder', 'users/portrait')

        const response = await fetch('/api/admin/uploads/image', {
          method: 'POST',
          body: formData
        })

        if (!response.ok) {
          setUploadError('Failed to upload portrait picture')
          return
        }

        const { url, key } = await response.json()
        uploadedPictures.push({ url, object_key: key })
      }

      syncPortraitPictures([...portraitPictures, ...uploadedPictures])
    } catch (err) {
      console.error('Upload error:', err)
      setUploadError('Error uploading portrait picture')
    } finally {
      setImageUploading(false)
      event.currentTarget.value = ''
    }
  }

  async function handlePortfolioArtImageUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files || [])
    if (files.length === 0) return

    setImageUploading(true)
    setUploadError(null)

    try {
      const uploadedImages: ProfileImage[] = []

      for (const file of files) {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('folder', 'artists/portfolio-art')

        const response = await fetch('/api/admin/uploads/image', {
          method: 'POST',
          body: formData
        })

        if (!response.ok) {
          setUploadError('Failed to upload portfolio art image')
          return
        }

        const { url, key } = await response.json()
        uploadedImages.push({ url, object_key: key })
      }

      setPortfolioArtImages([...portfolioArtImages, ...uploadedImages])
    } catch (err) {
      console.error('Upload error:', err)
      setUploadError('Error uploading portfolio art image')
    } finally {
      setImageUploading(false)
      event.currentTarget.value = ''
    }
  }

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

  const activeProfile = profile

  async function handleSave() {
    if (!user || !profile) {
      setError('User not authenticated')
      return
    }

    setSaving(true)
    setSuccess(false)
    setError(null)

    try {
      const payload = activeProfile.role === 'artist'
        ? {
            full_name: fullName,
            bio,
            avatar_url: avatarUrl,
            specialty,
            portfolio_links: portfolio,
            portfolio_art: portfolioArt,
            portfolio_art_images: portfolioArtImages,
            commissions_open: commissionsOpen,
            price_range: priceRange || null,
            contact_email: contactEmail || null,
            social_media_links: {
              website: websiteUrl || null,
              twitter: twitterUrl || null,
              x: twitterUrl || null,
              instagram: instagramUrl || null,
            },
          }
        : {
            stage_name: fullName,
            character_description: bio,
            avatar_url: avatarUrl,
            bio,
            date_of_birth: dateOfBirth || null,
            debut_date: debutDate || null,
            height: height || null,
            species: species || null,
            tags,
            likes,
            dislikes,
            portfolio_links: portfolio,
            vtuber_model_url: vtuberModelUrl || null,
            portrait_picture_url: portraitPictures[0]?.url || fullBodyModelUrl || null,
            portrait_picture_object_key: portraitPictures[0]?.object_key || null,
            portrait_pictures: portraitPictures,
            profile_card_url: profileCardUrl || null,
            support_url: supportUrl || null,
            featured_video_url: featuredVideoUrl || null,
            social_links: {
              youtube: youtubeUrl || null,
              twitch: twitchUrl || null,
              tiktok: tiktokUrl || null,
              instagram: instagramUrl || null,
              instagramUrl: instagramUrl || null,
              x: xUrl || null,
              xUrl: xUrl || null,
              twitter: xUrl || null,
              twitterUrl: xUrl || null,
            },
          }

      const response = await fetch('/api/dashboard/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id
        },
        body: JSON.stringify(payload)
      })

      if (response.ok) {
        setSuccess(true)
        setTimeout(() => setSuccess(false), 3000)
      } else {
        const err = await response.json()
        setError(err.error || 'Failed to save profile')
      }
    } catch (err) {
      console.error('Save error:', err)
      setError('Failed to save profile')
    } finally {
      setSaving(false)
    }
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

          {error && (
            <div className="alert alert-error mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l-2-2m0 0l-2-2m2 2l2-2m-2 2l-2 2m6-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {/* Profile Header Card */}
          <div className="card bg-base-200 shadow-xl mb-8">
            <div className="card-body">
              <h2 className="card-title text-2xl mb-4">Profile Header</h2>
              
              <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
                {/* Avatar Preview */}
                <div className="avatar">
                  <div className={`w-48 rounded-full ring ${activeProfile.role === 'artist' ? 'ring-secondary' : 'ring-primary'} ring-offset-base-100 ring-offset-4`}>
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
                      <span className="label-text font-semibold">Avatar</span>
                    </label>
                    <div className="join w-full">
                      <input
                        type="file"
                        accept="image/*"
                        className="file-input file-input-bordered join-item flex-1"
                        onChange={handleAvatarFileChange}
                        disabled={saving || imageUploading}
                      />
                      <span className="join-item flex items-center px-3">
                        {imageUploading && <span className="loading loading-spinner loading-sm"></span>}
                      </span>
                    </div>
                    {uploadError && <span className="text-error text-sm mt-2">{uploadError}</span>}
                    <label className="label mt-2">
                      <span className="label-text font-semibold text-sm">Or paste URL</span>
                    </label>
                    <input
                      type="text"
                      className="input input-bordered"
                      placeholder="https://example.com/avatar.jpg or /api/media/..."
                      value={avatarUrl}
                      onChange={(e) => setAvatarUrl(e.target.value)}
                      disabled={saving || imageUploading}
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

                  {(activeProfile.role === 'talent' || activeProfile.role === 'staff') && (
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
                  {activeProfile.role === 'artist' && (
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
          {(activeProfile.role === 'talent' || activeProfile.role === 'staff') && (
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
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="form-control md:col-span-2">
                            <label className="label">
                              <span className="label-text font-semibold">🎬 Featured Video URL</span>
                            </label>
                            <input
                              type="url"
                              className="input input-bordered"
                              placeholder="https://youtube.com/watch?v=... or https://twitch.tv/..."
                              value={featuredVideoUrl}
                              onChange={(e) => setFeaturedVideoUrl(e.target.value)}
                              disabled={saving}
                            />
                            <label className="label">
                              <span className="label-text-alt text-xs opacity-70">Optional YouTube or Twitch link for the featured video section</span>
                            </label>
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

                          <div className="form-control md:col-span-2">
                            <label className="label">
                              <span className="label-text font-semibold">❌ X URL</span>
                            </label>
                            <input
                              type="url"
                              className="input input-bordered"
                              placeholder="https://x.com/yourname"
                              value={xUrl}
                              onChange={(e) => setXUrl(e.target.value)}
                              disabled={saving}
                            />
                          </div>

                            <div className="form-control">
                              <label className="label">
                                <span className="label-text font-semibold">🔗 Profile Card URL</span>
                              </label>
                              <input
                                type="url"
                                className="input input-bordered"
                                placeholder="https://linktr.ee/yourname or https://guns.lol/yourname"
                                value={profileCardUrl}
                                onChange={(e) => setProfileCardUrl(e.target.value)}
                                disabled={saving}
                              />
                              <label className="label">
                                <span className="label-text text-xs opacity-70">Optional: link hub / social business card</span>
                              </label>
                            </div>

                              <div className="form-control">
                                <label className="label">
                                  <span className="label-text font-semibold">💖 Support Link</span>
                                </label>
                                <input
                                  type="url"
                                  className="input input-bordered"
                                  placeholder="https://ko-fi.com/yourname or https://onlyfans.com/..."
                                  value={supportUrl}
                                  onChange={(e) => setSupportUrl(e.target.value)}
                                  disabled={saving}
                                />
                                <label className="label">
                                  <span className="label-text text-xs opacity-70">Optional: Ko-fi / Support link</span>
                                </label>
                              </div>

                          <div className="form-control md:col-span-2">
                            <label className="label">
                              <span className="label-text font-semibold">📺 YouTube URL</span>
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
                        </div>
                )}
              </div>
            </div>
          )}

          {/* Artist: Social Links */}
          {activeProfile.role === 'artist' && (
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
                        <span className="label-text font-semibold">❌ X URL</span>
                      </label>
                      <input
                        type="url"
                        className="input input-bordered"
                        placeholder="https://x.com/yourname"
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

          {/* Talent: Character Info */}
          {(activeProfile.role === 'talent' || activeProfile.role === 'staff') && (
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
                          type="date"
                          className="input input-bordered"
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
                          type="date"
                          className="input input-bordered"
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

                      {/* Portrait Picture */}
                      <div className="form-control">
                        <label className="label">
                          <span className="label-text font-semibold">Portrait Pictures</span>
                          <span className="label-text-alt text-xs">One image shows at a time on the public card</span>
                        </label>
                        {portraitSizeHint ? (
                          <div className="alert alert-info py-2 px-3 mb-2 text-sm">
                            <span>
                              Current image: {portraitSizeHint.width}×{portraitSizeHint.height}px. Live portrait card size: {portraitSizeHint.recommendedWidth}×{portraitSizeHint.recommendedHeight}px.
                            </span>
                          </div>
                        ) : (
                          <p className="text-xs opacity-70 mb-2">
                            Add or paste a portrait image URL to see a recommended export size.
                          </p>
                        )}
                        <div className="flex flex-col gap-2">
                          {portraitPictures.length > 0 && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                              {portraitPictures.map((image, idx) => (
                                <div key={`${image.url}-${idx}`} className="card bg-base-300 shadow-md">
                                  <figure>
                                    <img src={image.url} alt={`Portrait ${idx + 1}`} className="w-full h-44 object-contain bg-base-100" />
                                  </figure>
                                  <div className="card-body p-3">
                                    <div className="flex items-center justify-between gap-2">
                                      <span className="badge badge-primary badge-sm">{idx === 0 ? 'Primary' : `#${idx + 1}`}</span>
                                      <button
                                        type="button"
                                        className="btn btn-ghost btn-xs btn-circle"
                                        onClick={() => handleRemovePortraitPicture(idx)}
                                        disabled={saving || imageUploading}
                                      >
                                        âœ•
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                          <div className="join w-full">
                            <input
                              type="file"
                              accept="image/*"
                              className="file-input file-input-bordered join-item flex-1"
                              multiple
                              onChange={handlePictureUpload}
                              disabled={saving || imageUploading}
                            />
                            <span className="join-item flex items-center px-3">
                              {imageUploading && <span className="loading loading-spinner loading-sm"></span>}
                            </span>
                          </div>
                          <div className="join w-full">
                            <input
                              type="url"
                              className="input input-bordered input-sm join-item flex-1"
                              placeholder="Or paste a portrait image URL"
                              value={portraitPictureInput}
                              onChange={(e) => setPortraitPictureInput(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault()
                                  handleAddPortraitPictureUrl()
                                }
                              }}
                              disabled={saving || imageUploading}
                            />
                            <button
                              type="button"
                              className="btn btn-primary btn-sm join-item"
                              onClick={handleAddPortraitPictureUrl}
                              disabled={saving || imageUploading}
                            >
                              Add URL
                            </button>
                          </div>
                        </div>
                        <div className="w-full overflow-hidden" style={{ height: 0 }} aria-hidden="true">
                          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
                            <div className="lg:col-span-1">
                              <div className="card bg-base-200 shadow-xl lg:sticky lg:top-24 h-full">
                                <div className="card-body p-4 h-full flex flex-col">
                                  <div ref={setPortraitSectionRef} className="rounded-xl overflow-hidden bg-base-300 border border-base-300 min-h-[520px] flex-1 flex items-center justify-center relative" />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
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
          {activeProfile.role === 'artist' && (
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
                        <span className="label-text font-semibold">Add Portfolio Website URL</span>
                      </label>
                      <div className="join w-full">
                        <input
                          type="url"
                          className="input input-bordered join-item flex-1"
                          placeholder="https://example.com/project"
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
                          Add URL
                        </button>
                      </div>
                    </div>

                    {portfolio.length > 0 && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {portfolio.map((url, idx) => (
                          <div key={idx} className="relative overflow-hidden rounded-lg group bg-base-300">
                            <div className="aspect-video">
                              <iframe
                                src={url}
                                title={`Portfolio ${idx + 1}`}
                                className="w-full h-full"
                                loading="lazy"
                              />
                            </div>
                            <a
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn btn-xs btn-ghost m-2"
                            >
                              Open URL
                            </a>
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

                    <div className="divider">Portfolio Art Images</div>

                    <div className="form-control mb-4">
                      <label className="label">
                        <span className="label-text font-semibold">Upload Portfolio Art Images</span>
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        className="file-input file-input-bordered w-full"
                        onChange={handlePortfolioArtImageUpload}
                        disabled={saving || imageUploading}
                      />
                    </div>

                    <div className="form-control mb-4">
                      <label className="label">
                        <span className="label-text font-semibold">Add Portfolio Art Image URL</span>
                      </label>
                      <div className="join w-full">
                        <input
                          type="url"
                          className="input input-bordered join-item flex-1"
                          placeholder="https://example.com/artwork.jpg"
                          value={portfolioArtInput}
                          onChange={(e) => setPortfolioArtInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault()
                              if (portfolioArtInput.trim()) {
                                setPortfolioArt([...portfolioArt, portfolioArtInput.trim()])
                                setPortfolioArtInput('')
                              }
                            }
                          }}
                          disabled={saving}
                        />
                        <button
                          type="button"
                          className="btn btn-accent join-item"
                          onClick={() => {
                            if (portfolioArtInput.trim()) {
                              setPortfolioArt([...portfolioArt, portfolioArtInput.trim()])
                              setPortfolioArtInput('')
                            }
                          }}
                          disabled={saving}
                        >
                          Add Art
                        </button>
                      </div>
                    </div>

                    {portfolioArtImages.length > 0 && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        {portfolioArtImages.map((image, idx) => (
                          <div key={`${image.url}-${idx}`} className="relative overflow-hidden rounded-lg group bg-base-300">
                            <div className="aspect-video">
                              <img src={image.url} alt={`Uploaded portfolio art ${idx + 1}`} className="w-full h-full object-cover" />
                            </div>
                            <button
                              type="button"
                              className="btn btn-error btn-sm btn-circle absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => setPortfolioArtImages(portfolioArtImages.filter((_, i) => i !== idx))}
                              disabled={saving}
                            >
                              âœ•
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {portfolioArt.length > 0 && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {portfolioArt.map((url, idx) => (
                          <div key={idx} className="relative overflow-hidden rounded-lg group bg-base-300">
                            <div className="aspect-video">
                              <img src={url} alt={`Portfolio art ${idx + 1}`} className="w-full h-full object-cover" />
                            </div>
                            <button
                              type="button"
                              className="btn btn-error btn-sm btn-circle absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => setPortfolioArt(portfolioArt.filter((_, i) => i !== idx))}
                              disabled={saving}
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {portfolio.length === 0 && portfolioArt.length === 0 && portfolioArtImages.length === 0 && (
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
              <div className="font-semibold">Account: {activeProfile.role} • {activeProfile.email}</div>
              <div className="text-sm opacity-70 mt-1">
                ✓ Changes save to PostgreSQL database
              </div>
            </div>
          </div>
        </Container>
        <Footer />
      </div>
    </div>
  )
}
