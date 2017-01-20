class Attendance
  include ActiveModel::Model

  attr_accessor :student_id, :first_name, :last_name, :school_name, :school_principal_name, :absences_count

  def full_name
    [first_name, last_name].compact.join(' ').to_s
  end
end
