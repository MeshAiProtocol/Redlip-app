# Icon Component

A simple wrapper for Lucide Icons that provides a consistent interface for using icons throughout your SvelteKit app.

## Usage

```svelte
<script>
  import Icon from '$lib/components/Icon.svelte';
</script>

<!-- Basic usage -->
<Icon name="heart" />

<!-- With custom size and color -->
<Icon name="settings" size={24} color="#007aff" />

<!-- With custom stroke width -->
<Icon name="star" size={20} strokeWidth={1.5} />

<!-- With custom CSS class -->
<Icon name="user" className="my-custom-class" />
```

## Available Icons

The component includes the following icons:

### Navigation
- `arrowLeft` - Left arrow
- `home` - Home icon
- `menu` - Hamburger menu
- `search` - Search icon

### Actions
- `plus` - Plus sign
- `minus` - Minus sign
- `check` - Checkmark
- `x` - X/close
- `edit` - Edit/pencil
- `copy` - Copy
- `share` - Share
- `trash2` - Delete/trash

### System
- `settings` - Settings gear
- `cpu` - CPU icon
- `hardDrive` - Hard drive
- `database` - Database
- `server` - Server
- `activity` - Activity/performance
- `wifi` - WiFi
- `battery` - Battery
- `signal` - Signal strength

### Media
- `play` - Play button
- `pause` - Pause button
- `volume2` - Volume up
- `volumeX` - Volume muted
- `camera` - Camera
- `image` - Image
- `file` - File
- `folder` - Folder

### Communication
- `mail` - Email
- `phone` - Phone
- `messageCircle` - Message
- `link` - Link
- `externalLink` - External link

### UI Elements
- `heart` - Heart/like
- `star` - Star/favorite
- `user` - User profile
- `lock` - Lock
- `unlock` - Unlock
- `eye` - Eye/visible
- `eyeOff` - Eye/visible off
- `key` - Key
- `shield` - Shield/security

### Status
- `alertCircle` - Alert/info
- `alertTriangle` - Warning
- `checkCircle` - Success
- `xCircle` - Error
- `helpCircle` - Help
- `info` - Information

### Data
- `download` - Download
- `upload` - Upload
- `trendingUp` - Trending up
- `trendingDown` - Trending down
- `barChart3` - Bar chart
- `pieChart` - Pie chart

### Time & Location
- `calendar` - Calendar
- `clock` - Clock/time
- `mapPin` - Location pin
- `globe` - Globe/world

### Weather & Nature
- `sun` - Sun
- `moon` - Moon
- `zap` - Lightning/energy
- `target` - Target/bullseye

### Technology
- `cloud` - Cloud
- `wifiOff` - WiFi off
- `plusCircle` - Plus in circle
- `minusCircle` - Minus in circle
- `refreshCw` - Refresh/reload

## Props

- `name` (string, required) - The name of the icon
- `size` (number, default: 24) - Size in pixels
- `color` (string, default: "currentColor") - Color of the icon
- `strokeWidth` (number, default: 2) - Stroke width
- `className` (string, default: "") - Additional CSS classes

## Adding New Icons

To add a new icon:

1. Import it from `lucide-svelte` in the script section
2. Add a conditional block in the template section
3. Use the icon name as the condition

Example:
```svelte
// In script section
import { NewIcon } from 'lucide-svelte';

// In template section
{:else if name === 'newIcon'}
  <NewIcon size={size} color={color} strokeWidth={strokeWidth} class={className} />
```

## Styling

The icons inherit the current text color by default. You can override this by passing a `color` prop or using CSS classes.

```svelte
<!-- Using color prop -->
<Icon name="heart" color="#ff3b30" />

<!-- Using CSS classes -->
<Icon name="star" className="text-yellow-500" />
``` 