<script lang="ts">
	import { Heart, Settings, Home, User, Search, Menu, X, Plus, Minus, Check, AlertCircle, Info, Star, Download, Upload, Play, Pause, Volume2, VolumeX, Sun, Moon, Wifi, Battery, Signal, Camera, Image, File, Folder, Trash2, Edit, Copy, Share, Link, ExternalLink, Mail, Phone, MessageCircle, Calendar, Clock, MapPin, Globe, Lock, Unlock, Eye, EyeOff, Key, Shield, Zap, Target, TrendingUp, TrendingDown, BarChart3, PieChart, Activity, Cpu, HardDrive, Database, Server, Cloud, WifiOff, AlertTriangle, HelpCircle, CheckCircle, XCircle, MinusCircle, PlusCircle, ArrowLeft, RefreshCw, List, ArrowRight, Loader, ChevronUp, ChevronDown, Type, ZoomIn, Move } from 'lucide-svelte';
	
	export let name: string;
	export let size: number = 24;
	export let color: string = 'currentColor';
	export let strokeWidth: number = 2;
	export let className: string = '';
</script>

{#if name === 'heart'}
	<Heart size={size} color={color} strokeWidth={strokeWidth} class={className} />
{:else if name === 'settings'}
	<Settings size={size} color={color} strokeWidth={strokeWidth} class={className} />
{:else if name === 'home'}
	<Home size={size} color={color} strokeWidth={strokeWidth} class={className} />
{:else if name === 'user'}
	<User size={size} color={color} strokeWidth={strokeWidth} class={className} />
{:else if name === 'search'}
	<Search size={size} color={color} strokeWidth={strokeWidth} class={className} />
{:else if name === 'menu'}
	<Menu size={size} color={color} strokeWidth={strokeWidth} class={className} />
{:else if name === 'x'}
	<X size={size} color={color} strokeWidth={strokeWidth} class={className} />
{:else if name === 'plus'}
	<Plus size={size} color={color} strokeWidth={strokeWidth} class={className} />
{:else if name === 'minus'}
	<Minus size={size} color={color} strokeWidth={strokeWidth} class={className} />
{:else if name === 'check'}
	<Check size={size} color={color} strokeWidth={strokeWidth} class={className} />
{:else if name === 'alertCircle'}
	<AlertCircle size={size} color={color} strokeWidth={strokeWidth} class={className} />
{:else if name === 'info'}
	<Info size={size} color={color} strokeWidth={strokeWidth} class={className} />
{:else if name === 'star'}
	<Star size={size} color={color} strokeWidth={strokeWidth} class={className} />
{:else if name === 'download'}
	<Download size={size} color={color} strokeWidth={strokeWidth} class={className} />
{:else if name === 'upload'}
	<Upload size={size} color={color} strokeWidth={strokeWidth} class={className} />
{:else if name === 'play'}
	<Play size={size} color={color} strokeWidth={strokeWidth} class={className} />
{:else if name === 'pause'}
	<Pause size={size} color={color} strokeWidth={strokeWidth} class={className} />
{:else if name === 'volume2'}
	<Volume2 size={size} color={color} strokeWidth={strokeWidth} class={className} />
{:else if name === 'volumeX'}
	<VolumeX size={size} color={color} strokeWidth={strokeWidth} class={className} />
{:else if name === 'sun'}
	<Sun size={size} color={color} strokeWidth={strokeWidth} class={className} />
{:else if name === 'moon'}
	<Moon size={size} color={color} strokeWidth={strokeWidth} class={className} />
{:else if name === 'wifi'}
	<Wifi size={size} color={color} strokeWidth={strokeWidth} class={className} />
{:else if name === 'battery'}
	<Battery size={size} color={color} strokeWidth={strokeWidth} class={className} />
{:else if name === 'signal'}
	<Signal size={size} color={color} strokeWidth={strokeWidth} class={className} />
{:else if name === 'camera'}
	<Camera size={size} color={color} strokeWidth={strokeWidth} class={className} />
{:else if name === 'image'}
	<Image size={size} color={color} strokeWidth={strokeWidth} class={className} />
{:else if name === 'file'}
	<File size={size} color={color} strokeWidth={strokeWidth} class={className} />
{:else if name === 'folder'}
	<Folder size={size} color={color} strokeWidth={strokeWidth} class={className} />
{:else if name === 'trash2'}
	<Trash2 size={size} color={color} strokeWidth={strokeWidth} class={className} />
{:else if name === 'edit'}
	<Edit size={size} color={color} strokeWidth={strokeWidth} class={className} />
{:else if name === 'copy'}
	<Copy size={size} color={color} strokeWidth={strokeWidth} class={className} />
{:else if name === 'share'}
	<Share size={size} color={color} strokeWidth={strokeWidth} class={className} />
{:else if name === 'link'}
	<Link size={size} color={color} strokeWidth={strokeWidth} class={className} />
{:else if name === 'externalLink'}
	<ExternalLink size={size} color={color} strokeWidth={strokeWidth} class={className} />
{:else if name === 'mail'}
	<Mail size={size} color={color} strokeWidth={strokeWidth} class={className} />
{:else if name === 'phone'}
	<Phone size={size} color={color} strokeWidth={strokeWidth} class={className} />
{:else if name === 'messageCircle'}
	<MessageCircle size={size} color={color} strokeWidth={strokeWidth} class={className} />
{:else if name === 'calendar'}
	<Calendar size={size} color={color} strokeWidth={strokeWidth} class={className} />
{:else if name === 'clock'}
	<Clock size={size} color={color} strokeWidth={strokeWidth} class={className} />
{:else if name === 'mapPin'}
	<MapPin size={size} color={color} strokeWidth={strokeWidth} class={className} />
{:else if name === 'globe'}
	<Globe size={size} color={color} strokeWidth={strokeWidth} class={className} />
{:else if name === 'lock'}
	<Lock size={size} color={color} strokeWidth={strokeWidth} class={className} />
{:else if name === 'unlock'}
	<Unlock size={size} color={color} strokeWidth={strokeWidth} class={className} />
{:else if name === 'eye'}
	<Eye size={size} color={color} strokeWidth={strokeWidth} class={className} />
{:else if name === 'eyeOff'}
	<EyeOff size={size} color={color} strokeWidth={strokeWidth} class={className} />
{:else if name === 'key'}
	<Key size={size} color={color} strokeWidth={strokeWidth} class={className} />
{:else if name === 'shield'}
	<Shield size={size} color={color} strokeWidth={strokeWidth} class={className} />
{:else if name === 'zap'}
	<Zap size={size} color={color} strokeWidth={strokeWidth} class={className} />
{:else if name === 'target'}
	<Target size={size} color={color} strokeWidth={strokeWidth} class={className} />
{:else if name === 'trendingUp'}
	<TrendingUp size={size} color={color} strokeWidth={strokeWidth} class={className} />
{:else if name === 'trendingDown'}
	<TrendingDown size={size} color={color} strokeWidth={strokeWidth} class={className} />
{:else if name === 'barChart3'}
	<BarChart3 size={size} color={color} strokeWidth={strokeWidth} class={className} />
{:else if name === 'pieChart'}
	<PieChart size={size} color={color} strokeWidth={strokeWidth} class={className} />
{:else if name === 'activity'}
	<Activity size={size} color={color} strokeWidth={strokeWidth} class={className} />
{:else if name === 'cpu'}
	<Cpu size={size} color={color} strokeWidth={strokeWidth} class={className} />
{:else if name === 'hardDrive'}
	<HardDrive size={size} color={color} strokeWidth={strokeWidth} class={className} />
{:else if name === 'database'}
	<Database size={size} color={color} strokeWidth={strokeWidth} class={className} />
{:else if name === 'server'}
	<Server size={size} color={color} strokeWidth={strokeWidth} class={className} />
{:else if name === 'cloud'}
	<Cloud size={size} color={color} strokeWidth={strokeWidth} class={className} />
{:else if name === 'wifiOff'}
	<WifiOff size={size} color={color} strokeWidth={strokeWidth} class={className} />
{:else if name === 'alertTriangle'}
	<AlertTriangle size={size} color={color} strokeWidth={strokeWidth} class={className} />
{:else if name === 'helpCircle'}
	<HelpCircle size={size} color={color} strokeWidth={strokeWidth} class={className} />
{:else if name === 'checkCircle'}
	<CheckCircle size={size} color={color} strokeWidth={strokeWidth} class={className} />
{:else if name === 'xCircle'}
	<XCircle size={size} color={color} strokeWidth={strokeWidth} class={className} />
{:else if name === 'minusCircle'}
	<MinusCircle size={size} color={color} strokeWidth={strokeWidth} class={className} />
{:else if name === 'plusCircle'}
	<PlusCircle size={size} color={color} strokeWidth={strokeWidth} class={className} />
{:else if name === 'arrowLeft'}
	<ArrowLeft size={size} color={color} strokeWidth={strokeWidth} class={className} />
{:else if name === 'refreshCw'}
	<RefreshCw size={size} color={color} strokeWidth={strokeWidth} class={className} />
{:else if name === 'list'}
	<List size={size} color={color} strokeWidth={strokeWidth} class={className} />
{:else if name === 'arrowRight'}
	<ArrowRight size={size} color={color} strokeWidth={strokeWidth} class={className} />
{:else if name === 'loader'}
	<Loader size={size} color={color} strokeWidth={strokeWidth} class={className} />
{:else if name === 'chevronUp'}
	<ChevronUp size={size} color={color} strokeWidth={strokeWidth} class={className} />
{:else if name === 'chevronDown'}
	<ChevronDown size={size} color={color} strokeWidth={strokeWidth} class={className} />
{:else if name === 'type'}
	<Type size={size} color={color} strokeWidth={strokeWidth} class={className} />
{:else if name === 'zoomIn'}
	<ZoomIn size={size} color={color} strokeWidth={strokeWidth} class={className} />
{:else if name === 'move'}
	<Move size={size} color={color} strokeWidth={strokeWidth} class={className} />
{:else}
	<!-- Fallback for unknown icons -->
	<div style="width: {size}px; height: {size}px; background: {color}; opacity: 0.3;" class={className}></div>
{/if} 