require 'csv'

class AttendanceSummary
  include ActiveModel::Model

  attr_accessor :csv_string, :csv

  def parse_csv
    self.csv ||= CSV.parse(csv_string, headers: true)
  end

  def average_absences_count(school_name)
    parse_csv

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

  def find(target)
    student_ids = target.is_a?(String) ? [target] : target

    parse_csv

    result = []

    csv.each do |row|
      if student_ids.include?(row['STUDENTID'])
        last_name, first_name = row['LASTFIRST'].split(', ')

        attendance = Attendance.new({
          student_id: row['STUDENTID'],
          first_name: first_name,
          last_name: last_name,
          school_name: row['school_name'],
          school_principal_name: row['ild'],
          absences_count: BigDecimal.new(row['abs'].to_s)
        })

        if target.is_a?(String)
          return attendance
        else
          result << attendance
        end
      end
    end

    target.is_a?(String) ? nil : result
  end
end
