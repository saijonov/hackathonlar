export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      hackathons: {
        Row: {
          city: string | null
          cover_url: string | null
          created_at: string
          description_en: string | null
          description_ru: string | null
          description_uz: string | null
          end_date: string | null
          format: string
          id: string
          name: string
          organizer_id: string | null
          prize_pool: string | null
          registration_url: string | null
          rejection_reason: string | null
          slug: string
          start_date: string | null
          status: string
          submitted_by: string | null
          telegram: string | null
          tracks: string[]
          updated_at: string
          website: string | null
        }
        Insert: {
          city?: string | null
          cover_url?: string | null
          created_at?: string
          description_en?: string | null
          description_ru?: string | null
          description_uz?: string | null
          end_date?: string | null
          format?: string
          id?: string
          name: string
          organizer_id?: string | null
          prize_pool?: string | null
          registration_url?: string | null
          rejection_reason?: string | null
          slug: string
          start_date?: string | null
          status?: string
          submitted_by?: string | null
          telegram?: string | null
          tracks?: string[]
          updated_at?: string
          website?: string | null
        }
        Update: {
          city?: string | null
          cover_url?: string | null
          created_at?: string
          description_en?: string | null
          description_ru?: string | null
          description_uz?: string | null
          end_date?: string | null
          format?: string
          id?: string
          name?: string
          organizer_id?: string | null
          prize_pool?: string | null
          registration_url?: string | null
          rejection_reason?: string | null
          slug?: string
          start_date?: string | null
          status?: string
          submitted_by?: string | null
          telegram?: string | null
          tracks?: string[]
          updated_at?: string
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hackathons_organizer_id_fkey"
            columns: ["organizer_id"]
            isOneToOne: false
            referencedRelation: "organizer_cards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hackathons_organizer_id_fkey"
            columns: ["organizer_id"]
            isOneToOne: false
            referencedRelation: "organizer_stats"
            referencedColumns: ["organizer_id"]
          },
          {
            foreignKeyName: "hackathons_organizer_id_fkey"
            columns: ["organizer_id"]
            isOneToOne: false
            referencedRelation: "organizers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hackathons_submitted_by_fkey"
            columns: ["submitted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      official_responses: {
        Row: {
          author_label: string
          body: string
          created_at: string
          id: string
          review_id: string
          updated_at: string
        }
        Insert: {
          author_label: string
          body: string
          created_at?: string
          id?: string
          review_id: string
          updated_at?: string
        }
        Update: {
          author_label?: string
          body?: string
          created_at?: string
          id?: string
          review_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "official_responses_review_id_fkey"
            columns: ["review_id"]
            isOneToOne: true
            referencedRelation: "admin_reviews"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "official_responses_review_id_fkey"
            columns: ["review_id"]
            isOneToOne: true
            referencedRelation: "public_reviews"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "official_responses_review_id_fkey"
            columns: ["review_id"]
            isOneToOne: true
            referencedRelation: "reviews"
            referencedColumns: ["id"]
          },
        ]
      }
      organizers: {
        Row: {
          created_at: string
          description_en: string | null
          description_ru: string | null
          description_uz: string | null
          id: string
          logo_url: string | null
          name: string
          slug: string
          telegram: string | null
          updated_at: string
          website: string | null
        }
        Insert: {
          created_at?: string
          description_en?: string | null
          description_ru?: string | null
          description_uz?: string | null
          id?: string
          logo_url?: string | null
          name: string
          slug: string
          telegram?: string | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          created_at?: string
          description_en?: string | null
          description_ru?: string | null
          description_uz?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          slug?: string
          telegram?: string | null
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string
          id: string
          role: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name: string
          id: string
          role?: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string
          id?: string
          role?: string
          updated_at?: string
        }
        Relationships: []
      }
      review_reports: {
        Row: {
          created_at: string
          id: string
          reason: string
          review_id: string
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          reason: string
          review_id: string
          status?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          reason?: string
          review_id?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "review_reports_review_id_fkey"
            columns: ["review_id"]
            isOneToOne: false
            referencedRelation: "admin_reviews"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "review_reports_review_id_fkey"
            columns: ["review_id"]
            isOneToOne: false
            referencedRelation: "public_reviews"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "review_reports_review_id_fkey"
            columns: ["review_id"]
            isOneToOne: false
            referencedRelation: "reviews"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "review_reports_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      review_votes: {
        Row: {
          created_at: string
          id: string
          review_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          review_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          review_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "review_votes_review_id_fkey"
            columns: ["review_id"]
            isOneToOne: false
            referencedRelation: "admin_reviews"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "review_votes_review_id_fkey"
            columns: ["review_id"]
            isOneToOne: false
            referencedRelation: "public_reviews"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "review_votes_review_id_fkey"
            columns: ["review_id"]
            isOneToOne: false
            referencedRelation: "reviews"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "review_votes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          body: string
          cons: string | null
          created_at: string
          edited_at: string | null
          hackathon_id: string
          id: string
          is_anonymous: boolean
          overall: number | null
          participated_as: string
          pros: string | null
          rating_communication: number
          rating_judging: number
          rating_organization: number
          rating_prizes: number
          rating_venue: number
          status: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          body: string
          cons?: string | null
          created_at?: string
          edited_at?: string | null
          hackathon_id: string
          id?: string
          is_anonymous?: boolean
          overall?: number | null
          participated_as?: string
          pros?: string | null
          rating_communication: number
          rating_judging: number
          rating_organization: number
          rating_prizes: number
          rating_venue: number
          status?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          body?: string
          cons?: string | null
          created_at?: string
          edited_at?: string | null
          hackathon_id?: string
          id?: string
          is_anonymous?: boolean
          overall?: number | null
          participated_as?: string
          pros?: string | null
          rating_communication?: number
          rating_judging?: number
          rating_organization?: number
          rating_prizes?: number
          rating_venue?: number
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_hackathon_id_fkey"
            columns: ["hackathon_id"]
            isOneToOne: false
            referencedRelation: "admin_hackathons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_hackathon_id_fkey"
            columns: ["hackathon_id"]
            isOneToOne: false
            referencedRelation: "hackathon_cards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_hackathon_id_fkey"
            columns: ["hackathon_id"]
            isOneToOne: false
            referencedRelation: "hackathon_stats"
            referencedColumns: ["hackathon_id"]
          },
          {
            foreignKeyName: "reviews_hackathon_id_fkey"
            columns: ["hackathon_id"]
            isOneToOne: false
            referencedRelation: "hackathons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      admin_hackathons: {
        Row: {
          avg_overall: number | null
          city: string | null
          cover_url: string | null
          created_at: string | null
          description_en: string | null
          description_ru: string | null
          description_uz: string | null
          end_date: string | null
          format: string | null
          id: string | null
          name: string | null
          organizer_id: string | null
          organizer_name: string | null
          organizer_slug: string | null
          prize_pool: string | null
          registration_url: string | null
          rejection_reason: string | null
          review_count: number | null
          slug: string | null
          start_date: string | null
          status: string | null
          submitted_by: string | null
          submitted_by_email: string | null
          submitted_by_name: string | null
          telegram: string | null
          tracks: string[] | null
          updated_at: string | null
          website: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hackathons_organizer_id_fkey"
            columns: ["organizer_id"]
            isOneToOne: false
            referencedRelation: "organizer_cards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hackathons_organizer_id_fkey"
            columns: ["organizer_id"]
            isOneToOne: false
            referencedRelation: "organizer_stats"
            referencedColumns: ["organizer_id"]
          },
          {
            foreignKeyName: "hackathons_organizer_id_fkey"
            columns: ["organizer_id"]
            isOneToOne: false
            referencedRelation: "organizers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hackathons_submitted_by_fkey"
            columns: ["submitted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_reviews: {
        Row: {
          author_avatar_url: string | null
          author_display_name: string | null
          author_email: string | null
          author_id: string | null
          body: string | null
          cons: string | null
          created_at: string | null
          edited_at: string | null
          hackathon_id: string | null
          hackathon_name: string | null
          hackathon_slug: string | null
          helpful_count: number | null
          id: string | null
          is_anonymous: boolean | null
          open_report_count: number | null
          overall: number | null
          participated_as: string | null
          pros: string | null
          rating_communication: number | null
          rating_judging: number | null
          rating_organization: number | null
          rating_prizes: number | null
          rating_venue: number | null
          report_reasons: string[] | null
          response_author_label: string | null
          response_body: string | null
          response_id: string | null
          status: string | null
          title: string | null
          updated_at: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_hackathon_id_fkey"
            columns: ["hackathon_id"]
            isOneToOne: false
            referencedRelation: "admin_hackathons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_hackathon_id_fkey"
            columns: ["hackathon_id"]
            isOneToOne: false
            referencedRelation: "hackathon_cards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_hackathon_id_fkey"
            columns: ["hackathon_id"]
            isOneToOne: false
            referencedRelation: "hackathon_stats"
            referencedColumns: ["hackathon_id"]
          },
          {
            foreignKeyName: "reviews_hackathon_id_fkey"
            columns: ["hackathon_id"]
            isOneToOne: false
            referencedRelation: "hackathons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_user_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      hackathon_cards: {
        Row: {
          avg_communication: number | null
          avg_judging: number | null
          avg_organization: number | null
          avg_overall: number | null
          avg_prizes: number | null
          avg_venue: number | null
          city: string | null
          cover_url: string | null
          created_at: string | null
          description_en: string | null
          description_ru: string | null
          description_uz: string | null
          dist_1: number | null
          dist_2: number | null
          dist_3: number | null
          dist_4: number | null
          dist_5: number | null
          effective_end_date: string | null
          effective_start_date: string | null
          end_date: string | null
          format: string | null
          id: string | null
          name: string | null
          organizer_avg_overall: number | null
          organizer_hackathon_count: number | null
          organizer_id: string | null
          organizer_logo_url: string | null
          organizer_name: string | null
          organizer_rated_hackathon_count: number | null
          organizer_review_count: number | null
          organizer_slug: string | null
          prize_pool: string | null
          registration_url: string | null
          review_count: number | null
          slug: string | null
          sort_date: string | null
          start_date: string | null
          telegram: string | null
          tracks: string[] | null
          website: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hackathons_organizer_id_fkey"
            columns: ["organizer_id"]
            isOneToOne: false
            referencedRelation: "organizer_cards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hackathons_organizer_id_fkey"
            columns: ["organizer_id"]
            isOneToOne: false
            referencedRelation: "organizer_stats"
            referencedColumns: ["organizer_id"]
          },
          {
            foreignKeyName: "hackathons_organizer_id_fkey"
            columns: ["organizer_id"]
            isOneToOne: false
            referencedRelation: "organizers"
            referencedColumns: ["id"]
          },
        ]
      }
      hackathon_cities: {
        Row: {
          city: string | null
          hackathon_count: number | null
        }
        Relationships: []
      }
      hackathon_stats: {
        Row: {
          avg_communication: number | null
          avg_judging: number | null
          avg_organization: number | null
          avg_overall: number | null
          avg_prizes: number | null
          avg_venue: number | null
          dist_1: number | null
          dist_2: number | null
          dist_3: number | null
          dist_4: number | null
          dist_5: number | null
          hackathon_id: string | null
          review_count: number | null
        }
        Relationships: []
      }
      organizer_cards: {
        Row: {
          avg_communication: number | null
          avg_judging: number | null
          avg_organization: number | null
          avg_overall: number | null
          avg_prizes: number | null
          avg_venue: number | null
          created_at: string | null
          description_en: string | null
          description_ru: string | null
          description_uz: string | null
          hackathon_count: number | null
          id: string | null
          logo_url: string | null
          name: string | null
          past_hackathon_count: number | null
          rated_hackathon_count: number | null
          review_count: number | null
          slug: string | null
          telegram: string | null
          website: string | null
        }
        Relationships: []
      }
      organizer_stats: {
        Row: {
          avg_communication: number | null
          avg_judging: number | null
          avg_organization: number | null
          avg_overall: number | null
          avg_prizes: number | null
          avg_venue: number | null
          hackathon_count: number | null
          organizer_id: string | null
          past_hackathon_count: number | null
          rated_hackathon_count: number | null
          review_count: number | null
        }
        Relationships: []
      }
      platform_stats: {
        Row: {
          avg_overall: number | null
          hackathon_count: number | null
          organizer_count: number | null
          review_count: number | null
        }
        Relationships: []
      }
      public_reviews: {
        Row: {
          author_id: string | null
          avatar_url: string | null
          body: string | null
          cons: string | null
          created_at: string | null
          display_name: string | null
          edited_at: string | null
          hackathon_cover_url: string | null
          hackathon_id: string | null
          hackathon_name: string | null
          hackathon_slug: string | null
          helpful_count: number | null
          id: string | null
          is_anonymous: boolean | null
          overall: number | null
          participated_as: string | null
          pros: string | null
          rating_communication: number | null
          rating_judging: number | null
          rating_organization: number | null
          rating_prizes: number | null
          rating_venue: number | null
          response_author_label: string | null
          response_body: string | null
          response_created_at: string | null
          title: string | null
          updated_at: string | null
          viewer_has_voted: boolean | null
          viewer_is_author: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_hackathon_id_fkey"
            columns: ["hackathon_id"]
            isOneToOne: false
            referencedRelation: "admin_hackathons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_hackathon_id_fkey"
            columns: ["hackathon_id"]
            isOneToOne: false
            referencedRelation: "hackathon_cards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_hackathon_id_fkey"
            columns: ["hackathon_id"]
            isOneToOne: false
            referencedRelation: "hackathon_stats"
            referencedColumns: ["hackathon_id"]
          },
          {
            foreignKeyName: "reviews_hackathon_id_fkey"
            columns: ["hackathon_id"]
            isOneToOne: false
            referencedRelation: "hackathons"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      has_admin_access: { Args: never; Returns: boolean }
      is_admin: { Args: never; Returns: boolean }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const

