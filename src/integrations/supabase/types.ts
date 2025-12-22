export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      agent_runs: {
        Row: {
          agent_name: string
          completed_at: string | null
          confidence_score: number | null
          created_at: string
          demo_session_id: string
          error_message: string | null
          id: string
          input_query: string | null
          replay_count: number
          started_at: string
          status: Database["public"]["Enums"]["run_status"]
          token_usage: number | null
        }
        Insert: {
          agent_name?: string
          completed_at?: string | null
          confidence_score?: number | null
          created_at?: string
          demo_session_id: string
          error_message?: string | null
          id?: string
          input_query?: string | null
          replay_count?: number
          started_at?: string
          status?: Database["public"]["Enums"]["run_status"]
          token_usage?: number | null
        }
        Update: {
          agent_name?: string
          completed_at?: string | null
          confidence_score?: number | null
          created_at?: string
          demo_session_id?: string
          error_message?: string | null
          id?: string
          input_query?: string | null
          replay_count?: number
          started_at?: string
          status?: Database["public"]["Enums"]["run_status"]
          token_usage?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "agent_runs_demo_session_id_fkey"
            columns: ["demo_session_id"]
            isOneToOne: false
            referencedRelation: "demo_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_steps: {
        Row: {
          agent_run_id: string
          confidence: number | null
          created_at: string
          id: string
          input: Json | null
          latency_ms: number | null
          output: Json | null
          step_index: number
          step_type: Database["public"]["Enums"]["step_type"]
          tool_name: string | null
        }
        Insert: {
          agent_run_id: string
          confidence?: number | null
          created_at?: string
          id?: string
          input?: Json | null
          latency_ms?: number | null
          output?: Json | null
          step_index: number
          step_type: Database["public"]["Enums"]["step_type"]
          tool_name?: string | null
        }
        Update: {
          agent_run_id?: string
          confidence?: number | null
          created_at?: string
          id?: string
          input?: Json | null
          latency_ms?: number | null
          output?: Json | null
          step_index?: number
          step_type?: Database["public"]["Enums"]["step_type"]
          tool_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agent_steps_agent_run_id_fkey"
            columns: ["agent_run_id"]
            isOneToOne: false
            referencedRelation: "agent_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      demo_sessions: {
        Row: {
          company: string
          created_at: string
          email: string
          evaluation_notes: string | null
          expires_at: string
          id: string
          name: string
          role: string
          run_count: number
        }
        Insert: {
          company: string
          created_at?: string
          email: string
          evaluation_notes?: string | null
          expires_at?: string
          id?: string
          name: string
          role: string
          run_count?: number
        }
        Update: {
          company?: string
          created_at?: string
          email?: string
          evaluation_notes?: string | null
          expires_at?: string
          id?: string
          name?: string
          role?: string
          run_count?: number
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      run_status: "pending" | "running" | "success" | "failed" | "timeout"
      step_type: "prompt" | "tool_call" | "tool_result" | "reasoning" | "output"
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
  public: {
    Enums: {
      run_status: ["pending", "running", "success", "failed", "timeout"],
      step_type: ["prompt", "tool_call", "tool_result", "reasoning", "output"],
    },
  },
} as const
