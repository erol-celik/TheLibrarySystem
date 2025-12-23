import { Sparkles, Zap, Search, Heart, BookOpen, Award, Library } from 'lucide-react';

export interface CategoryAsset {
    icon: any;
    color: string;
    image: string;
}

export const CATEGORY_ASSETS: Record<string, CategoryAsset> = {
    'Fantasy': {
        icon: Sparkles,
        color: 'from-purple-500 to-pink-500',
        image: 'https://images.unsplash.com/photo-1614544048536-0d28caf77f41?crop=entropy&cs=tinysrgb&fit=max&fm=jpg'
    },
    'Science Fiction': {
        icon: Zap,
        color: 'from-blue-500 to-cyan-500',
        image: 'https://images.unsplash.com/photo-1635698054698-1eaf72c5a894?crop=entropy&cs=tinysrgb&fit=max&fm=jpg'
    },
    'Mystery': {
        icon: Search,
        color: 'from-gray-700 to-gray-900',
        image: 'https://images.unsplash.com/photo-1698954634383-eba274a1b1c7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg'
    },
    'Romance': {
        icon: Heart,
        color: 'from-pink-500 to-rose-500',
        image: 'https://images.unsplash.com/photo-1711185901354-73cb6b666c32?crop=entropy&cs=tinysrgb&fit=max&fm=jpg'
    },
    'Non-Fiction': {
        icon: BookOpen,
        color: 'from-green-500 to-emerald-500',
        image: 'https://images.unsplash.com/photo-1658842042844-eeb5ad17b7d3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg'
    },
    'Biography': {
        icon: Award,
        color: 'from-orange-500 to-amber-500',
        image: 'https://images.unsplash.com/photo-1582739010387-0b49ea2adaf6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg'
    },
    'History': {
        icon: Library,
        color: 'from-yellow-600 to-orange-700',
        image: 'https://images.unsplash.com/photo-1461360370896-922624d12aa1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg'
    }
};

export const DEFAULT_CATEGORY_ASSET: CategoryAsset = {
    icon: BookOpen,
    color: 'from-indigo-500 to-purple-500',
    image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?crop=entropy&cs=tinysrgb&fit=max&fm=jpg'
};

export interface CategoryCard {
    name: string;
    count: number | null;
    icon: any;
    color: string;
    image: string;
}

export function getCategoryCards(
    categories: string[] | undefined,
    stats: { categoryDistribution?: Record<string, number> } | null
): CategoryCard[] {
    return Array.from(new Set(categories || []))
        .filter((cat): cat is string => !!cat && typeof cat === 'string')
        .map(catName => {
            const assets = CATEGORY_ASSETS[catName] || DEFAULT_CATEGORY_ASSET;
            let count: number | null = null;

            if (stats?.categoryDistribution) {
                if (stats.categoryDistribution[catName] !== undefined) {
                    count = stats.categoryDistribution[catName];
                } else {
                    // Normalize for case-insensitive lookup
                    const lowerCat = catName.toLowerCase();
                    const foundKey = Object.keys(stats.categoryDistribution).find(k => k.toLowerCase() === lowerCat);
                    if (foundKey) {
                        count = stats.categoryDistribution[foundKey];
                    } else {
                        count = 0;
                    }
                }
            }

            return {
                name: catName,
                count: count,
                ...assets
            };
        });
}
