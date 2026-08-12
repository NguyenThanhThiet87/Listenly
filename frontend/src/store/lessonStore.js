import { create } from 'zustand';

export const useLessonStore = create((set) => ({
    lessonId: null,
    status: 'idle', // idle, processing, ready, failed
    segments: [],
    totalSegments: 0,
    currentSegmentIndex: 0,
    
    setLessonInfo: (id, status) => set({ lessonId: id, status }),
    setSegmentsData: (segments, total) => set({ segments, totalSegments: total, status: 'ready' }),
    nextSegment: () => set((state) => ({ 
        currentSegmentIndex: Math.min(state.currentSegmentIndex + 1, state.segments.length - 1) 
    })),
    prevSegment: () => set((state) => ({ 
        currentSegmentIndex: Math.max(state.currentSegmentIndex - 1, 0) 
    })),
    resetToStart: () => set({ currentSegmentIndex: 0 }),
    reset: () => set({
        lessonId: null,
        status: 'idle',
        segments: [],
        totalSegments: 0,
        currentSegmentIndex: 0,
    })
}));
