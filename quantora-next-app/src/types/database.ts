export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string
          name: string
          email: string
          role: 'ADMIN' | 'CONTRIBUTOR' | 'GUEST'
          reputation: number
          badge: string
          avatar_url: string | null
          bio: string | null
          institution: string | null
          country: string | null
          website: string | null
          linkedin?: string | null
          orcid?: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username: string
          name: string
          email: string
          role?: 'ADMIN' | 'CONTRIBUTOR' | 'GUEST'
          reputation?: number
          badge?: string
          avatar_url?: string | null
          bio?: string | null
          institution?: string | null
          country?: string | null
          website?: string | null
        }
        Update: Partial<Omit<Database['public']['Tables']['profiles']['Insert'], 'id'>>
      }
      papers: {
        Row: {
          id: string
          title: string
          abstract: string
          category: string
          author_id: string
          institution: string
          country: string
          tags: string
          references_text: string | null
          file_url: string
          file_name: string
          file_size: string
          status: 'PENDING' | 'APPROVED' | 'REJECTED'
          citations: number
          downloads: number
          likes: number
          peer_reviewed: boolean
          ai_summary: string | null
          ai_keywords: string | null
          trust_label: string
          forked_from_id: string | null
          search_vector: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          abstract: string
          category: string
          author_id: string
          institution: string
          country?: string
          tags?: string
          references_text?: string | null
          file_url: string
          file_name: string
          file_size: string
          status?: 'PENDING' | 'APPROVED' | 'REJECTED'
          citations?: number
          downloads?: number
          likes?: number
          peer_reviewed?: boolean
          ai_summary?: string | null
          ai_keywords?: string | null
          trust_label?: string
          forked_from_id?: string | null
        }
        Update: Partial<Database['public']['Tables']['papers']['Insert']>
      }
      paper_versions: {
        Row: {
          id: string
          paper_id: string
          version: string
          summary: string
          author: string
          created_at: string
        }
        Insert: {
          id?: string
          paper_id: string
          version?: string
          summary: string
          author: string
        }
        Update: Partial<Database['public']['Tables']['paper_versions']['Insert']>
      }
      comments: {
        Row: {
          id: string
          paper_id: string
          user_id: string
          text: string
          reputation: number
          created_at: string
        }
        Insert: {
          id?: string
          paper_id: string
          user_id: string
          text: string
          reputation?: number
        }
        Update: Partial<Database['public']['Tables']['comments']['Insert']>
      }
      insights: {
        Row: {
          id: string
          author_id: string
          content: string
          tags: string
          category: string
          upvotes_count: number
          comments_count: number
          created_at: string
        }
        Insert: {
          id?: string
          author_id: string
          content: string
          tags?: string
          category?: string
          upvotes_count?: number
          comments_count?: number
        }
        Update: Partial<Database['public']['Tables']['insights']['Insert']>
      }
      insight_upvotes: {
        Row: {
          insight_id: string
          user_id: string
          created_at: string
        }
        Insert: {
          insight_id: string
          user_id: string
        }
        Update: never
      }
      rnd_challenges: {
        Row: {
          id: string
          title: string
          sponsor: string
          logo_url: string | null
          description: string
          details: string
          reward: string
          rep_award: number
          category: string
          difficulty: string
          deadline: string | null
          teams_count: number
          solutions_count: number
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          sponsor: string
          logo_url?: string | null
          description: string
          details?: string
          reward: string
          rep_award?: number
          category: string
          difficulty?: string
          deadline?: string | null
          teams_count?: number
          solutions_count?: number
          is_active?: boolean
        }
        Update: Partial<Database['public']['Tables']['rnd_challenges']['Insert']>
      }
      rnd_participants: {
        Row: {
          challenge_id: string
          user_id: string
          joined_at: string
        }
        Insert: {
          challenge_id: string
          user_id: string
        }
        Update: never
      }
      rnd_submissions: {
        Row: {
          id: string
          challenge_id: string
          user_id: string
          title: string
          description: string
          file_url: string | null
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          challenge_id: string
          user_id: string
          title: string
          description: string
          file_url?: string | null
          status?: string
        }
        Update: Partial<Database['public']['Tables']['rnd_submissions']['Insert']>
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}

// Convenience type aliases
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Paper = Database['public']['Tables']['papers']['Row']
export type PaperVersion = Database['public']['Tables']['paper_versions']['Row']
export type Comment = Database['public']['Tables']['comments']['Row']
export type Insight = Database['public']['Tables']['insights']['Row']
export type InsightUpvote = Database['public']['Tables']['insight_upvotes']['Row']
export type RndChallenge = Database['public']['Tables']['rnd_challenges']['Row']
export type RndParticipant = Database['public']['Tables']['rnd_participants']['Row']
export type RndSubmission = Database['public']['Tables']['rnd_submissions']['Row']

// Extended types with joins
export type PaperWithAuthor = Paper & {
  profiles: Pick<Profile, 'id' | 'name' | 'username' | 'avatar_url' | 'institution'>
}

export type InsightWithAuthor = Insight & {
  profiles: Pick<Profile, 'id' | 'name' | 'username' | 'avatar_url' | 'badge'>
  userHasUpvoted?: boolean
}

export type CommentWithAuthor = Comment & {
  profiles: Pick<Profile, 'id' | 'name' | 'username' | 'avatar_url'>
}
