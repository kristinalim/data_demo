module Pdfs
  class AttendanceLetter < Base
    attr_accessor :attendance_summary, :attendance

    def initialize(attendance_summary, attendance, pdf_options)
      self.attendance_summary = attendance_summary
      self.attendance = attendance

      super(pdf_options)
    end

    def render
      WickedPdf.new.pdf_from_string(
        context.render_to_string('pdfs/attendance_letter/main', {
          locals: {
            attendance: attendance,
            letter_date: Time.zone.today,
            letter_date_format: '%B %d, %Y',
            letter_writer: attendance.school_principal_name,
            letter_writer_description: "Principal - #{attendance.school_name}",
            school_name: attendance.school_name,
            school_phone: '+0123456789', # TODO: Replace with actual school phone number.
            data: {
              average_absences_count: attendance_summary.average_absences_count(attendance.school_name)
            }
          },
          layout: 'application'
        })
      )
    end
  end
end
