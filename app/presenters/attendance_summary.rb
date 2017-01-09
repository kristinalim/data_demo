require 'csv'

class AttendanceSummary
  include ActiveModel::Model

  attr_accessor :csv_string, :csv

  def parse_csv
    self.csv ||= CSV.parse(csv_string, headers: true)
  end

  def average_absences_count(school_name)
    parse_csv
    Rails.logger.info "average_absences_count: #{school_name}"

    student_count = 0
    absences_total = 0

    csv.each do |row|
      if row['school_name'] == school_name
        student_count += 1
        absences_total += BigDecimal.new(row['abs'].to_s)
      end
    end

    unless student_count == 0
      Rails.logger.info "absences_total: #{absences_total}"
      Rails.logger.info "student_count: #{student_count}"

      (1.0 * absences_total / student_count).round(1)
    else
      0
    end
  end

  def find(student_id)
    parse_csv

    csv.each do |row|
      if row['STUDENTID'] == student_id
        last_name, first_name = row['LASTFIRST'].split(', ')

        return Attendance.new({
          first_name: first_name,
          last_name: last_name,
          school_name: row['school_name'],
          school_principal_name: row['ild'],
          absences_count: BigDecimal.new(row['abs'].to_s)
        })
      end
    end
  end
end
