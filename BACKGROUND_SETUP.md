# Background Images Setup Guide

## ✅ What I've Done

### 1. **Updated Homepage (`app/page.tsx`)**
- Replaced gradient background with full-screen image
- Uses: `/assets/images/background/starmy-background.png`
- Added overlay for better text readability
- Background stays fixed while hero section scrolls and blurs

### 2. **Created Reusable Background Component (`components/PageBackground.tsx`)**
- Props:
  - `rotate`: boolean (default: true) - Rotates image 90 degrees
  - `blur`: boolean (default: true) - Applies 50% blur effect
  - `opacity`: number (default: 50) - Controls overlay opacity (0-100)

### 3. **Updated Pages with Rotated & Blurred Background**
- ✅ VTubers page (`app/vtubers/page.tsx`)
- ✅ Artists page (`app/artists/page.tsx`)

### 4. **Created Directory Structure**
```
public/
  assets/
    images/
      background/
        starmy-background.png  ← Place your image here
      icons/
        starmy-logo.png  ← Place your logo here
```

---

## 📁 Where to Place Your Images

### Background Image:
**Path**: `c:\Users\MakotoAzusa\Desktop\StarMy\public\assets\images\background\starmy-background.png`

### Logo Image:
**Path**: `c:\Users\MakotoAzusa\Desktop\StarMy\public\assets\images\icons\starmy-logo.png`

---

## 🎨 How to Apply Background to Other Pages

For any page, import and add the `PageBackground` component:

```tsx
import PageBackground from "@/components/PageBackground";

export default function YourPage() {
  return (
    <div className="min-h-screen bg-base-100 relative">
      {/* Add background with rotation and blur */}
      <PageBackground rotate={true} blur={true} opacity={50} />
      
      {/* Wrap content in relative z-10 div */}
      <div className="relative z-10">
        <Navbar />
        {/* Your page content */}
        <Footer />
      </div>
    </div>
  );
}
```

---

## 🔧 Customization Options

### Homepage (no rotation/blur):
- Background is full-screen, clear, behind hero
- Has 30% purple overlay for text readability

### Other Pages (rotated & blurred):
```tsx
<PageBackground 
  rotate={true}    // Rotate 90 degrees
  blur={true}      // Apply blur
  opacity={50}     // 50% overlay (adjust 0-100)
/>
```

**Adjust these values:**
- `opacity={30}` - More background visible
- `opacity={70}` - More overlay, less background
- `rotate={false}` - No rotation
- `blur={false}` - Clear background

---

## 📝 Remaining Pages to Update

Add `PageBackground` to these pages:

- [ ] `app/news/page.tsx`
- [ ] `app/about/page.tsx`
- [ ] `app/career/page.tsx`
- [ ] `app/faq/page.tsx`
- [ ] `app/privacy/page.tsx`
- [ ] `app/terms/page.tsx`
- [ ] `app/admin/page.tsx`
- [ ] `app/admin/login/page.tsx`
- [ ] `app/admin/dashboard/page.tsx`
- [ ] Individual profile pages (`app/vtubers/[id]/page.tsx`, `app/artists/[id]/page.tsx`)

### Quick Template:
1. Import: `import PageBackground from "@/components/PageBackground";`
2. Change: `<div className="min-h-screen bg-base-100">` 
   to: `<div className="min-h-screen bg-base-100 relative">`
3. Add after opening div: `<PageBackground rotate={true} blur={true} opacity={50} />`
4. Wrap content: `<div className="relative z-10">{content}</div>`

---

## 🚀 Next Steps

1. **Place your images** in the folders created
2. **Refresh browser** - homepage and VTubers/Artists pages should show new backgrounds
3. **Apply to remaining pages** using the template above
4. **Adjust opacity** if backgrounds are too strong/weak

---

## 🐛 Troubleshooting

**Background not showing?**
- Check image path: `public\assets\images\background\starmy-background.png`
- Refresh with Ctrl+Shift+R
- Check console for 404 errors

**Background too bright/dark?**
- Adjust `opacity` prop (lower = more visible background)

**Blur too strong/weak?**
- Edit `PageBackground.tsx` line: `filter: blur(8px)` 
- Change `8px` to `4px` (less) or `12px` (more)

**Rotation not centered?**
- Background uses `scale(1.5)` to ensure coverage
- Adjust in `PageBackground.tsx` if needed
