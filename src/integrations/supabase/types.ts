export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      ai_chat_history: {
        Row: {
          content: string
          created_at: string | null
          founder_id: string
          id: string
          message_type: string
          session_id: string
          timestamp: string
        }
        Insert: {
          content: string
          created_at?: string | null
          founder_id: string
          id?: string
          message_type: string
          session_id: string
          timestamp?: string
        }
        Update: {
          content?: string
          created_at?: string | null
          founder_id?: string
          id?: string
          message_type?: string
          session_id?: string
          timestamp?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_chat_history_founder_id_fkey"
            columns: ["founder_id"]
            isOneToOne: false
            referencedRelation: "founders"
            referencedColumns: ["id"]
          },
        ]
      }
      client_import: {
        Row: {
          Address: string | null
          "Agree to Liability Waiver": boolean | null
          Birthday: string | null
          "Client Email": string
          "Client Name": string | null
          created_at: string
          "First Name": string
          "First Seen": string | null
          id: string
          "Last Name": string
          "Last Seen": string | null
          "Marketing Email Opt-in": boolean | null
          "Marketing Text Opt In": string | null
          "Phone Number": string | null
          "Pre-Arketa Milestone Count": string | null
          Tags: string | null
          "Transactional Text Opt In": string | null
          updated_at: string
        }
        Insert: {
          Address?: string | null
          "Agree to Liability Waiver"?: boolean | null
          Birthday?: string | null
          "Client Email": string
          "Client Name"?: string | null
          created_at?: string
          "First Name": string
          "First Seen"?: string | null
          id?: string
          "Last Name": string
          "Last Seen"?: string | null
          "Marketing Email Opt-in"?: boolean | null
          "Marketing Text Opt In"?: string | null
          "Phone Number"?: string | null
          "Pre-Arketa Milestone Count"?: string | null
          Tags?: string | null
          "Transactional Text Opt In"?: string | null
          updated_at?: string
        }
        Update: {
          Address?: string | null
          "Agree to Liability Waiver"?: boolean | null
          Birthday?: string | null
          "Client Email"?: string
          "Client Name"?: string | null
          created_at?: string
          "First Name"?: string
          "First Seen"?: string | null
          id?: string
          "Last Name"?: string
          "Last Seen"?: string | null
          "Marketing Email Opt-in"?: boolean | null
          "Marketing Text Opt In"?: string | null
          "Phone Number"?: string | null
          "Pre-Arketa Milestone Count"?: string | null
          Tags?: string | null
          "Transactional Text Opt In"?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      collaboration_history: {
        Row: {
          action_details: string | null
          action_type: string | null
          created_at: string | null
          id: string
          timestamp: string
          user_email: string
          workspace_inventory_id: string | null
        }
        Insert: {
          action_details?: string | null
          action_type?: string | null
          created_at?: string | null
          id?: string
          timestamp: string
          user_email: string
          workspace_inventory_id?: string | null
        }
        Update: {
          action_details?: string | null
          action_type?: string | null
          created_at?: string | null
          id?: string
          timestamp?: string
          user_email?: string
          workspace_inventory_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "collaboration_history_workspace_inventory_id_fkey"
            columns: ["workspace_inventory_id"]
            isOneToOne: false
            referencedRelation: "workspace_inventory"
            referencedColumns: ["id"]
          },
        ]
      }
      communication_history: {
        Row: {
          content: string
          created_at: string
          error_message: string | null
          id: string
          lead_id: string
          sent_at: string | null
          sequence_id: string | null
          status: Database["public"]["Enums"]["communication_status"]
          subject: string | null
          template_id: string | null
          type: Database["public"]["Enums"]["communication_type"]
        }
        Insert: {
          content: string
          created_at?: string
          error_message?: string | null
          id?: string
          lead_id: string
          sent_at?: string | null
          sequence_id?: string | null
          status?: Database["public"]["Enums"]["communication_status"]
          subject?: string | null
          template_id?: string | null
          type: Database["public"]["Enums"]["communication_type"]
        }
        Update: {
          content?: string
          created_at?: string
          error_message?: string | null
          id?: string
          lead_id?: string
          sent_at?: string | null
          sequence_id?: string | null
          status?: Database["public"]["Enums"]["communication_status"]
          subject?: string | null
          template_id?: string | null
          type?: Database["public"]["Enums"]["communication_type"]
        }
        Relationships: [
          {
            foreignKeyName: "communication_history_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "communication_history_sequence_id_fkey"
            columns: ["sequence_id"]
            isOneToOne: false
            referencedRelation: "communication_sequences"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "communication_history_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "email_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      communication_sequences: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          segment: Database["public"]["Enums"]["customer_segment"] | null
          trigger_type: Database["public"]["Enums"]["trigger_type"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          segment?: Database["public"]["Enums"]["customer_segment"] | null
          trigger_type: Database["public"]["Enums"]["trigger_type"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          segment?: Database["public"]["Enums"]["customer_segment"] | null
          trigger_type?: Database["public"]["Enums"]["trigger_type"]
          updated_at?: string
        }
        Relationships: []
      }
      companies: {
        Row: {
          cik: string
          cik_lookup_status: string | null
          company_name: string | null
          created_at: string
          id: string
          name: string
          num_historical_years: number | null
        }
        Insert: {
          cik: string
          cik_lookup_status?: string | null
          company_name?: string | null
          created_at?: string
          id?: string
          name: string
          num_historical_years?: number | null
        }
        Update: {
          cik?: string
          cik_lookup_status?: string | null
          company_name?: string | null
          created_at?: string
          id?: string
          name?: string
          num_historical_years?: number | null
        }
        Relationships: []
      }
      content_tags: {
        Row: {
          auto_generated: boolean | null
          created_at: string | null
          id: string
          tag_category: string | null
          tag_name: string
          workspace_inventory_id: string | null
        }
        Insert: {
          auto_generated?: boolean | null
          created_at?: string | null
          id?: string
          tag_category?: string | null
          tag_name: string
          workspace_inventory_id?: string | null
        }
        Update: {
          auto_generated?: boolean | null
          created_at?: string | null
          id?: string
          tag_category?: string | null
          tag_name?: string
          workspace_inventory_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "content_tags_workspace_inventory_id_fkey"
            columns: ["workspace_inventory_id"]
            isOneToOne: false
            referencedRelation: "workspace_inventory"
            referencedColumns: ["id"]
          },
        ]
      }
      conversation_messages: {
        Row: {
          content: string
          conversation_id: string
          id: string
          metadata: Json | null
          rich_content: Json | null
          sender_type: string
          sender_user_id: string | null
          timestamp: string | null
        }
        Insert: {
          content: string
          conversation_id: string
          id?: string
          metadata?: Json | null
          rich_content?: Json | null
          sender_type: string
          sender_user_id?: string | null
          timestamp?: string | null
        }
        Update: {
          content?: string
          conversation_id?: string
          id?: string
          metadata?: Json | null
          rich_content?: Json | null
          sender_type?: string
          sender_user_id?: string | null
          timestamp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_conversation_messages_conversation_id"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "project_conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_conversation_messages_sender_user_id"
            columns: ["sender_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      Documents: {
        Row: {
          content: string | null
          created_at: string
          embedding: string | null
          id: number
          metadata: string | null
        }
        Insert: {
          content?: string | null
          created_at?: string
          embedding?: string | null
          id?: number
          metadata?: string | null
        }
        Update: {
          content?: string | null
          created_at?: string
          embedding?: string | null
          id?: number
          metadata?: string | null
        }
        Relationships: []
      }
      email_metadata: {
        Row: {
          attachment_count: number | null
          bcc_emails: string[] | null
          cc_emails: string[] | null
          created_at: string | null
          custom_labels: string[] | null
          has_attachments: boolean | null
          id: string
          is_important: boolean | null
          is_read: boolean | null
          is_starred: boolean | null
          labels: Database["public"]["Enums"]["email_label"][] | null
          message_id: string
          recipient_emails: string[] | null
          sender_email: string | null
          sender_name: string | null
          subject: string | null
          thread_id: string | null
          workspace_inventory_id: string | null
        }
        Insert: {
          attachment_count?: number | null
          bcc_emails?: string[] | null
          cc_emails?: string[] | null
          created_at?: string | null
          custom_labels?: string[] | null
          has_attachments?: boolean | null
          id?: string
          is_important?: boolean | null
          is_read?: boolean | null
          is_starred?: boolean | null
          labels?: Database["public"]["Enums"]["email_label"][] | null
          message_id: string
          recipient_emails?: string[] | null
          sender_email?: string | null
          sender_name?: string | null
          subject?: string | null
          thread_id?: string | null
          workspace_inventory_id?: string | null
        }
        Update: {
          attachment_count?: number | null
          bcc_emails?: string[] | null
          cc_emails?: string[] | null
          created_at?: string | null
          custom_labels?: string[] | null
          has_attachments?: boolean | null
          id?: string
          is_important?: boolean | null
          is_read?: boolean | null
          is_starred?: boolean | null
          labels?: Database["public"]["Enums"]["email_label"][] | null
          message_id?: string
          recipient_emails?: string[] | null
          sender_email?: string | null
          sender_name?: string | null
          subject?: string | null
          thread_id?: string | null
          workspace_inventory_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "email_metadata_workspace_inventory_id_fkey"
            columns: ["workspace_inventory_id"]
            isOneToOne: false
            referencedRelation: "workspace_inventory"
            referencedColumns: ["id"]
          },
        ]
      }
      email_templates: {
        Row: {
          content: string
          created_at: string
          delay_hours: number | null
          id: string
          is_active: boolean
          name: string
          segment: Database["public"]["Enums"]["customer_segment"] | null
          subject: string
          type: Database["public"]["Enums"]["email_template_type"]
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          delay_hours?: number | null
          id?: string
          is_active?: boolean
          name: string
          segment?: Database["public"]["Enums"]["customer_segment"] | null
          subject: string
          type: Database["public"]["Enums"]["email_template_type"]
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          delay_hours?: number | null
          id?: string
          is_active?: boolean
          name?: string
          segment?: Database["public"]["Enums"]["customer_segment"] | null
          subject?: string
          type?: Database["public"]["Enums"]["email_template_type"]
          updated_at?: string
        }
        Relationships: []
      }
      emily_customers: {
        Row: {
          address_line_1: string | null
          address_line_2: string | null
          agree_to_liability_waiver: boolean | null
          city: string | null
          company_name: string | null
          country: string | null
          created_at: string
          created_by: string | null
          credit_limit: number | null
          custom_fields: Json | null
          customer_since: string | null
          customer_status: string | null
          customer_type: string | null
          date_of_birth: string | null
          department: string | null
          email: string
          first_name: string
          first_seen: string | null
          gender: string | null
          id: string
          job_title: string | null
          last_name: string
          last_purchase_date: string | null
          last_seen: string | null
          marketing_consent: boolean | null
          marketing_text_opt_in: boolean | null
          notes: string | null
          phone: string | null
          pre_arketa_milestone_count: number | null
          preferred_contact_method: string | null
          state: string | null
          tags: string[] | null
          total_spent: number | null
          transactional_text_opt_in: boolean | null
          updated_at: string
          updated_by: string | null
          zip_code: string | null
        }
        Insert: {
          address_line_1?: string | null
          address_line_2?: string | null
          agree_to_liability_waiver?: boolean | null
          city?: string | null
          company_name?: string | null
          country?: string | null
          created_at?: string
          created_by?: string | null
          credit_limit?: number | null
          custom_fields?: Json | null
          customer_since?: string | null
          customer_status?: string | null
          customer_type?: string | null
          date_of_birth?: string | null
          department?: string | null
          email: string
          first_name: string
          first_seen?: string | null
          gender?: string | null
          id?: string
          job_title?: string | null
          last_name: string
          last_purchase_date?: string | null
          last_seen?: string | null
          marketing_consent?: boolean | null
          marketing_text_opt_in?: boolean | null
          notes?: string | null
          phone?: string | null
          pre_arketa_milestone_count?: number | null
          preferred_contact_method?: string | null
          state?: string | null
          tags?: string[] | null
          total_spent?: number | null
          transactional_text_opt_in?: boolean | null
          updated_at?: string
          updated_by?: string | null
          zip_code?: string | null
        }
        Update: {
          address_line_1?: string | null
          address_line_2?: string | null
          agree_to_liability_waiver?: boolean | null
          city?: string | null
          company_name?: string | null
          country?: string | null
          created_at?: string
          created_by?: string | null
          credit_limit?: number | null
          custom_fields?: Json | null
          customer_since?: string | null
          customer_status?: string | null
          customer_type?: string | null
          date_of_birth?: string | null
          department?: string | null
          email?: string
          first_name?: string
          first_seen?: string | null
          gender?: string | null
          id?: string
          job_title?: string | null
          last_name?: string
          last_purchase_date?: string | null
          last_seen?: string | null
          marketing_consent?: boolean | null
          marketing_text_opt_in?: boolean | null
          notes?: string | null
          phone?: string | null
          pre_arketa_milestone_count?: number | null
          preferred_contact_method?: string | null
          state?: string | null
          tags?: string[] | null
          total_spent?: number | null
          transactional_text_opt_in?: boolean | null
          updated_at?: string
          updated_by?: string | null
          zip_code?: string | null
        }
        Relationships: []
      }
      employees: {
        Row: {
          created_at: string | null
          department: string | null
          email: string
          first_name: string
          id: number
          job_title: string | null
          last_name: string
          manager_id: number | null
          notes: string | null
          phone: string | null
          profile_image_url: string | null
          start_date: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          department?: string | null
          email: string
          first_name: string
          id?: number
          job_title?: string | null
          last_name: string
          manager_id?: number | null
          notes?: string | null
          phone?: string | null
          profile_image_url?: string | null
          start_date?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          department?: string | null
          email?: string
          first_name?: string
          id?: number
          job_title?: string | null
          last_name?: string
          manager_id?: number | null
          notes?: string | null
          phone?: string | null
          profile_image_url?: string | null
          start_date?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "employees_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      financial_data: {
        Row: {
          company_id: string
          created_at: string
          fiscal_year: number
          id: string
          line_item_name: string
          statement_type: string
          value: number | null
        }
        Insert: {
          company_id: string
          created_at?: string
          fiscal_year: number
          id?: string
          line_item_name: string
          statement_type: string
          value?: number | null
        }
        Update: {
          company_id?: string
          created_at?: string
          fiscal_year?: number
          id?: string
          line_item_name?: string
          statement_type?: string
          value?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "financial_data_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      financial_facts: {
        Row: {
          accession_number: string
          company_id: string | null
          created_at: string | null
          fact_description: string | null
          fact_label: string | null
          fact_name: string
          filing_date: string
          fiscal_period: string | null
          fiscal_year: number | null
          form_type: string
          frame: string | null
          id: string
          period_end_date: string
          period_start_date: string | null
          taxonomy: string
          unit: string
          value: number
        }
        Insert: {
          accession_number: string
          company_id?: string | null
          created_at?: string | null
          fact_description?: string | null
          fact_label?: string | null
          fact_name: string
          filing_date: string
          fiscal_period?: string | null
          fiscal_year?: number | null
          form_type: string
          frame?: string | null
          id?: string
          period_end_date: string
          period_start_date?: string | null
          taxonomy: string
          unit: string
          value: number
        }
        Update: {
          accession_number?: string
          company_id?: string | null
          created_at?: string | null
          fact_description?: string | null
          fact_label?: string | null
          fact_name?: string
          filing_date?: string
          fiscal_period?: string | null
          fiscal_year?: number | null
          form_type?: string
          frame?: string | null
          id?: string
          period_end_date?: string
          period_start_date?: string | null
          taxonomy?: string
          unit?: string
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "financial_facts_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      founder_projects: {
        Row: {
          created_at: string | null
          custom_instructions: string | null
          description: string | null
          founder_id: string
          id: string
          name: string
          owner_user_id: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          custom_instructions?: string | null
          description?: string | null
          founder_id: string
          id?: string
          name: string
          owner_user_id: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          custom_instructions?: string | null
          description?: string | null
          founder_id?: string
          id?: string
          name?: string
          owner_user_id?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_founder_projects_founder_id"
            columns: ["founder_id"]
            isOneToOne: true
            referencedRelation: "founders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_founder_projects_owner_user_id"
            columns: ["owner_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      founders: {
        Row: {
          arr: number | null
          avatar: string | null
          bio: string | null
          call_recordings_count: number | null
          churn_rate: number | null
          company_name: string
          created_at: string | null
          current_stage: string | null
          customer_count: number | null
          documents_count: number | null
          email_threads_count: number | null
          first_interaction: string | null
          growth_rate: number | null
          id: string
          last_interaction: string | null
          meeting_notes_count: number | null
          name: string
          stage: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          arr?: number | null
          avatar?: string | null
          bio?: string | null
          call_recordings_count?: number | null
          churn_rate?: number | null
          company_name: string
          created_at?: string | null
          current_stage?: string | null
          customer_count?: number | null
          documents_count?: number | null
          email_threads_count?: number | null
          first_interaction?: string | null
          growth_rate?: number | null
          id?: string
          last_interaction?: string | null
          meeting_notes_count?: number | null
          name: string
          stage?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          arr?: number | null
          avatar?: string | null
          bio?: string | null
          call_recordings_count?: number | null
          churn_rate?: number | null
          company_name?: string
          created_at?: string | null
          current_stage?: string | null
          customer_count?: number | null
          documents_count?: number | null
          email_threads_count?: number | null
          first_interaction?: string | null
          growth_rate?: number | null
          id?: string
          last_interaction?: string | null
          meeting_notes_count?: number | null
          name?: string
          stage?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      hinton_database: {
        Row: {
          Active: string | null
          "Actual Grad": string | null
          Age: number | null
          "Class Type": string | null
          Closed: string | null
          "Contract Date": string | null
          Course: string | null
          DOB: string | null
          Drop: string | null
          Education: string | null
          Email: string | null
          Enrollment: string | null
          "Graduate Status": string | null
          HighSchoolGrad: string | null
          HourCount: number | null
          id: number
          "LoanAmount ": string | null
          Marital: string | null
          Name: string | null
          PhoneNumber: string | null
          Race: string | null
          Referral: string | null
          RequiredHours: number | null
          SAP: string | null
          Sex: string | null
          Start: string | null
          StudentID: string | null
          "Title IV Elig": string | null
          "Tracking Code": string | null
          Veteran: string | null
        }
        Insert: {
          Active?: string | null
          "Actual Grad"?: string | null
          Age?: number | null
          "Class Type"?: string | null
          Closed?: string | null
          "Contract Date"?: string | null
          Course?: string | null
          DOB?: string | null
          Drop?: string | null
          Education?: string | null
          Email?: string | null
          Enrollment?: string | null
          "Graduate Status"?: string | null
          HighSchoolGrad?: string | null
          HourCount?: number | null
          id?: number
          "LoanAmount "?: string | null
          Marital?: string | null
          Name?: string | null
          PhoneNumber?: string | null
          Race?: string | null
          Referral?: string | null
          RequiredHours?: number | null
          SAP?: string | null
          Sex?: string | null
          Start?: string | null
          StudentID?: string | null
          "Title IV Elig"?: string | null
          "Tracking Code"?: string | null
          Veteran?: string | null
        }
        Update: {
          Active?: string | null
          "Actual Grad"?: string | null
          Age?: number | null
          "Class Type"?: string | null
          Closed?: string | null
          "Contract Date"?: string | null
          Course?: string | null
          DOB?: string | null
          Drop?: string | null
          Education?: string | null
          Email?: string | null
          Enrollment?: string | null
          "Graduate Status"?: string | null
          HighSchoolGrad?: string | null
          HourCount?: number | null
          id?: number
          "LoanAmount "?: string | null
          Marital?: string | null
          Name?: string | null
          PhoneNumber?: string | null
          Race?: string | null
          Referral?: string | null
          RequiredHours?: number | null
          SAP?: string | null
          Sex?: string | null
          Start?: string | null
          StudentID?: string | null
          "Title IV Elig"?: string | null
          "Tracking Code"?: string | null
          Veteran?: string | null
        }
        Relationships: []
      }
      leads: {
        Row: {
          created_at: string
          email: string
          id: string
          last_contacted_at: string | null
          name: string
          notes: string | null
          phone: string
          referral_source: string
          segment: Database["public"]["Enums"]["customer_segment"] | null
          status: Database["public"]["Enums"]["lead_status"]
          submitted_at: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          last_contacted_at?: string | null
          name: string
          notes?: string | null
          phone: string
          referral_source: string
          segment?: Database["public"]["Enums"]["customer_segment"] | null
          status?: Database["public"]["Enums"]["lead_status"]
          submitted_at?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          last_contacted_at?: string | null
          name?: string
          notes?: string | null
          phone?: string
          referral_source?: string
          segment?: Database["public"]["Enums"]["customer_segment"] | null
          status?: Database["public"]["Enums"]["lead_status"]
          submitted_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      milestones: {
        Row: {
          completed: boolean | null
          created_at: string | null
          date: string | null
          description: string | null
          founder_id: string
          id: string
          title: string
          updated_at: string | null
        }
        Insert: {
          completed?: boolean | null
          created_at?: string | null
          date?: string | null
          description?: string | null
          founder_id: string
          id?: string
          title: string
          updated_at?: string | null
        }
        Update: {
          completed?: boolean | null
          created_at?: string | null
          date?: string | null
          description?: string | null
          founder_id?: string
          id?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "milestones_founder_id_fkey"
            columns: ["founder_id"]
            isOneToOne: false
            referencedRelation: "founders"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          first_name: string | null
          id: string
          last_name: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          first_name?: string | null
          id: string
          last_name?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      project_conversations: {
        Row: {
          created_at: string | null
          id: string
          project_id: string
          started_by_user_id: string | null
          summary: string | null
          title: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          project_id: string
          started_by_user_id?: string | null
          summary?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          project_id?: string
          started_by_user_id?: string | null
          summary?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_project_conversations_project_id"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "founder_projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_project_conversations_started_by_user_id"
            columns: ["started_by_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      project_resources: {
        Row: {
          content_hash: string | null
          created_at: string | null
          description: string | null
          file_mime_type: string | null
          file_size_bytes: number | null
          id: string
          metadata: Json | null
          name: string
          project_id: string
          resource_type: string
          source_url: string | null
          updated_at: string | null
          uploaded_by_user_id: string | null
        }
        Insert: {
          content_hash?: string | null
          created_at?: string | null
          description?: string | null
          file_mime_type?: string | null
          file_size_bytes?: number | null
          id?: string
          metadata?: Json | null
          name: string
          project_id: string
          resource_type: string
          source_url?: string | null
          updated_at?: string | null
          uploaded_by_user_id?: string | null
        }
        Update: {
          content_hash?: string | null
          created_at?: string | null
          description?: string | null
          file_mime_type?: string | null
          file_size_bytes?: number | null
          id?: string
          metadata?: Json | null
          name?: string
          project_id?: string
          resource_type?: string
          source_url?: string | null
          updated_at?: string | null
          uploaded_by_user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_project_resources_project_id"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "founder_projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_project_resources_uploaded_by_user_id"
            columns: ["uploaded_by_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          budget: number | null
          created_at: string | null
          description: string | null
          end_date: string | null
          id: number
          manager_id: number | null
          name: string
          start_date: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          budget?: number | null
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          id?: number
          manager_id?: number | null
          name: string
          start_date?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          budget?: number | null
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          id?: number
          manager_id?: number | null
          name?: string
          start_date?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "projects_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      qr_codes: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          scan_count: number
          updated_at: string
          url: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          scan_count?: number
          updated_at?: string
          url: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          scan_count?: number
          updated_at?: string
          url?: string
        }
        Relationships: []
      }
      resources: {
        Row: {
          associated_founder_ids: string[] | null
          created_at: string | null
          description: string | null
          file_type: string | null
          file_url: string | null
          founder_id: string | null
          id: string
          tags: string[] | null
          thumbnail_url: string | null
          title: string
          type: string
          updated_at: string | null
          uploaded_at: string | null
        }
        Insert: {
          associated_founder_ids?: string[] | null
          created_at?: string | null
          description?: string | null
          file_type?: string | null
          file_url?: string | null
          founder_id?: string | null
          id?: string
          tags?: string[] | null
          thumbnail_url?: string | null
          title: string
          type: string
          updated_at?: string | null
          uploaded_at?: string | null
        }
        Update: {
          associated_founder_ids?: string[] | null
          created_at?: string | null
          description?: string | null
          file_type?: string | null
          file_url?: string | null
          founder_id?: string | null
          id?: string
          tags?: string[] | null
          thumbnail_url?: string | null
          title?: string
          type?: string
          updated_at?: string | null
          uploaded_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "resources_founder_id_fkey"
            columns: ["founder_id"]
            isOneToOne: false
            referencedRelation: "founders"
            referencedColumns: ["id"]
          },
        ]
      }
      sec_extraction_jobs: {
        Row: {
          accession_number: string
          cik: string
          company_id: string | null
          completed_at: string | null
          created_at: string
          document_url: string
          error_message: string | null
          extraction_method: string
          form_type: string
          id: string
          started_at: string | null
          status: string
        }
        Insert: {
          accession_number: string
          cik: string
          company_id?: string | null
          completed_at?: string | null
          created_at?: string
          document_url: string
          error_message?: string | null
          extraction_method: string
          form_type: string
          id?: string
          started_at?: string | null
          status?: string
        }
        Update: {
          accession_number?: string
          cik?: string
          company_id?: string | null
          completed_at?: string | null
          created_at?: string
          document_url?: string
          error_message?: string | null
          extraction_method?: string
          form_type?: string
          id?: string
          started_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "sec_extraction_jobs_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      sec_financial_data: {
        Row: {
          accession_number: string
          cik: string
          company_id: string | null
          confidence_score: number | null
          created_at: string
          extraction_method: string
          filing_date: string
          fiscal_period: string | null
          fiscal_year: number | null
          form_type: string
          id: string
          line_item_concept: string | null
          line_item_name: string
          period_end_date: string
          source_url: string | null
          statement_type: string
          unit: string | null
          updated_at: string
          value: number | null
        }
        Insert: {
          accession_number: string
          cik: string
          company_id?: string | null
          confidence_score?: number | null
          created_at?: string
          extraction_method: string
          filing_date: string
          fiscal_period?: string | null
          fiscal_year?: number | null
          form_type: string
          id?: string
          line_item_concept?: string | null
          line_item_name: string
          period_end_date: string
          source_url?: string | null
          statement_type: string
          unit?: string | null
          updated_at?: string
          value?: number | null
        }
        Update: {
          accession_number?: string
          cik?: string
          company_id?: string | null
          confidence_score?: number | null
          created_at?: string
          extraction_method?: string
          filing_date?: string
          fiscal_period?: string | null
          fiscal_year?: number | null
          form_type?: string
          id?: string
          line_item_concept?: string | null
          line_item_name?: string
          period_end_date?: string
          source_url?: string | null
          statement_type?: string
          unit?: string | null
          updated_at?: string
          value?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "sec_financial_data_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      secrets: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          updated_at: string | null
          value: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          updated_at?: string | null
          value: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          updated_at?: string | null
          value?: string
        }
        Relationships: []
      }
      sequence_steps: {
        Row: {
          created_at: string
          delay_hours: number
          id: string
          sequence_id: string
          step_order: number
          template_id: string
        }
        Insert: {
          created_at?: string
          delay_hours?: number
          id?: string
          sequence_id: string
          step_order: number
          template_id: string
        }
        Update: {
          created_at?: string
          delay_hours?: number
          id?: string
          sequence_id?: string
          step_order?: number
          template_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sequence_steps_sequence_id_fkey"
            columns: ["sequence_id"]
            isOneToOne: false
            referencedRelation: "communication_sequences"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sequence_steps_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "email_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      smartshared_transactions: {
        Row: {
          adjustments: number | null
          card: number | null
          cash: number | null
          check_number: string | null
          disbursement: number | null
          fee: number | null
          full_name: string | null
          id: number
          kit_and_book: number | null
          ledger_type_misc: number | null
          misc: number | null
          net_amount: number | null
          new_balance: number | null
          other: number | null
          penalty: number | null
          program: string | null
          refund: number | null
          total_canceled: string | null
          total_charges: number | null
          total_receipts: string | null
          total_write_off: string | null
          transaction_date: string | null
          tuition: number | null
          write_off: number | null
        }
        Insert: {
          adjustments?: number | null
          card?: number | null
          cash?: number | null
          check_number?: string | null
          disbursement?: number | null
          fee?: number | null
          full_name?: string | null
          id?: number
          kit_and_book?: number | null
          ledger_type_misc?: number | null
          misc?: number | null
          net_amount?: number | null
          new_balance?: number | null
          other?: number | null
          penalty?: number | null
          program?: string | null
          refund?: number | null
          total_canceled?: string | null
          total_charges?: number | null
          total_receipts?: string | null
          total_write_off?: string | null
          transaction_date?: string | null
          tuition?: number | null
          write_off?: number | null
        }
        Update: {
          adjustments?: number | null
          card?: number | null
          cash?: number | null
          check_number?: string | null
          disbursement?: number | null
          fee?: number | null
          full_name?: string | null
          id?: number
          kit_and_book?: number | null
          ledger_type_misc?: number | null
          misc?: number | null
          net_amount?: number | null
          new_balance?: number | null
          other?: number | null
          penalty?: number | null
          program?: string | null
          refund?: number | null
          total_canceled?: string | null
          total_charges?: number | null
          total_receipts?: string | null
          total_write_off?: string | null
          transaction_date?: string | null
          tuition?: number | null
          write_off?: number | null
        }
        Relationships: []
      }
      users: {
        Row: {
          auth_user_id: string | null
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          auth_user_id?: string | null
          created_at?: string | null
          email: string
          full_name?: string | null
          id?: string
          updated_at?: string | null
        }
        Update: {
          auth_user_id?: string | null
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      workspace_inventory: {
        Row: {
          content_text: string | null
          content_type: Database["public"]["Enums"]["content_type"]
          created_at: string | null
          created_date: string | null
          file_size: number | null
          google_id: string
          id: string
          last_accessed: string | null
          metadata: Json | null
          mime_type: string | null
          modified_date: string | null
          owner_email: string | null
          parent_folder_id: string | null
          permissions: Json | null
          shared_with: string[] | null
          summary: string | null
          synced_at: string | null
          title: string
          updated_at: string | null
          url: string | null
        }
        Insert: {
          content_text?: string | null
          content_type: Database["public"]["Enums"]["content_type"]
          created_at?: string | null
          created_date?: string | null
          file_size?: number | null
          google_id: string
          id?: string
          last_accessed?: string | null
          metadata?: Json | null
          mime_type?: string | null
          modified_date?: string | null
          owner_email?: string | null
          parent_folder_id?: string | null
          permissions?: Json | null
          shared_with?: string[] | null
          summary?: string | null
          synced_at?: string | null
          title: string
          updated_at?: string | null
          url?: string | null
        }
        Update: {
          content_text?: string | null
          content_type?: Database["public"]["Enums"]["content_type"]
          created_at?: string | null
          created_date?: string | null
          file_size?: number | null
          google_id?: string
          id?: string
          last_accessed?: string | null
          metadata?: Json | null
          mime_type?: string | null
          modified_date?: string | null
          owner_email?: string | null
          parent_folder_id?: string | null
          permissions?: Json | null
          shared_with?: string[] | null
          summary?: string | null
          synced_at?: string | null
          title?: string
          updated_at?: string | null
          url?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_api_key: {
        Args: { service: string }
        Returns: string
      }
      get_ready_messages: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: string
          lead_id: string
          template_id: string
          sequence_id: string
          content: string
          lead_name: string
          lead_phone: string
        }[]
      }
      import_csv_to_emily_customers: {
        Args: Record<PropertyKey, never>
        Returns: {
          imported_count: number
          error_count: number
        }[]
      }
      trigger_communication_sequence: {
        Args: {
          p_lead_id: string
          p_trigger_type: Database["public"]["Enums"]["trigger_type"]
          p_segment?: Database["public"]["Enums"]["customer_segment"]
        }
        Returns: undefined
      }
    }
    Enums: {
      communication_log_status: "Sent" | "Failed" | "Pending"
      communication_status: "sent" | "failed" | "pending"
      communication_type: "Email" | "SMS" | "InAppNotification"
      content_type: "document" | "email" | "sheet" | "slide"
      customer_segment:
        | "prenatal"
        | "seniors"
        | "young-professionals"
        | "general"
      document_category:
        | "Enrollment"
        | "Compliance"
        | "Student Record"
        | "Financial"
        | "Other"
      email_label:
        | "inbox"
        | "sent"
        | "drafts"
        | "spam"
        | "trash"
        | "important"
        | "starred"
        | "archive"
        | "custom"
      email_template_type:
        | "welcome"
        | "follow-up"
        | "re-engagement"
        | "post-class"
        | "intro-package"
      financial_transaction_type:
        | "TuitionCharge"
        | "FeeCharge"
        | "PaymentReceived"
        | "FinAidDisbursement"
        | "Refund"
        | "Adjustment"
      lead_status: "new" | "contacted" | "in-progress" | "converted" | "lost"
      practical_log_status: "Pending Verification" | "Approved" | "Denied"
      survey_assignment_status:
        | "Assigned"
        | "In Progress"
        | "Completed"
        | "Overdue"
      trigger_type:
        | "new-lead"
        | "intro-purchase"
        | "first-class"
        | "inactive-90-days"
        | "intro-package-purchased"
        | "first-class-attended"
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
      communication_log_status: ["Sent", "Failed", "Pending"],
      communication_status: ["sent", "failed", "pending"],
      communication_type: ["Email", "SMS", "InAppNotification"],
      content_type: ["document", "email", "sheet", "slide"],
      customer_segment: [
        "prenatal",
        "seniors",
        "young-professionals",
        "general",
      ],
      document_category: [
        "Enrollment",
        "Compliance",
        "Student Record",
        "Financial",
        "Other",
      ],
      email_label: [
        "inbox",
        "sent",
        "drafts",
        "spam",
        "trash",
        "important",
        "starred",
        "archive",
        "custom",
      ],
      email_template_type: [
        "welcome",
        "follow-up",
        "re-engagement",
        "post-class",
        "intro-package",
      ],
      financial_transaction_type: [
        "TuitionCharge",
        "FeeCharge",
        "PaymentReceived",
        "FinAidDisbursement",
        "Refund",
        "Adjustment",
      ],
      lead_status: ["new", "contacted", "in-progress", "converted", "lost"],
      practical_log_status: ["Pending Verification", "Approved", "Denied"],
      survey_assignment_status: [
        "Assigned",
        "In Progress",
        "Completed",
        "Overdue",
      ],
      trigger_type: [
        "new-lead",
        "intro-purchase",
        "first-class",
        "inactive-90-days",
        "intro-package-purchased",
        "first-class-attended",
      ],
    },
  },
} as const
