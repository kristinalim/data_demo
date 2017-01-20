class Attendance
  include ActiveModel::Model

  attr_accessor :student_id, :first_name, :last_name, :school_name, :school_principal_name, :absences_count
end
