export type ActivityRow = {
  id: string;
  name: string;
  category: string;
  time_label: string | null;
  group_name: string;
  start_time: string | null;
  end_time: string | null;
  points: number;
  schedule_days: number[];
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type ActivityLogRow = {
  id: string;
  activity_id: string | null;
  activity_name_snapshot: string;
  category_snapshot: string;
  points_snapshot: number;
  scheduled_time_snapshot: string | null;
  activity_date: string;
  is_completed: boolean;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
};

export type AppSettingRow = {
  id: string;
  setting_key: string;
  setting_value: unknown;
  updated_at: string;
};