import Member from '../models/Member.js';
import JoinUs from '../models/JoinUs.js';
import Contact from '../models/Contact.js';
import EventRegistration from '../models/EventRegistration.js';
import ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';

export const exportData = async (req, res) => {
  try {
    const { resource, format, status, eventId } = req.query;

    let data = [];
    let columns = [];
    let filename = `${resource}_export_${new Date().toISOString().slice(0, 10)}`;

    // Fetch data based on resource
    switch (resource) {
      case 'members':
        const memberFilter = status && status !== 'All' ? { status } : {};
        const members = await Member.find(memberFilter).sort({ createdAt: -1 });
        columns = [
          { header: 'Full Name', key: 'fullName', width: 25 },
          { header: 'Reg Number', key: 'registrationNumber', width: 15 },
          { header: 'Course', key: 'course', width: 15 },
          { header: 'Section', key: 'section', width: 10 },
          { header: 'Role', key: 'role', width: 20 },
          { header: 'Email', key: 'email', width: 25 },
          { header: 'Phone', key: 'phone', width: 15 },
          { header: 'WhatsApp', key: 'whatsapp', width: 15 },
          { header: 'Status', key: 'status', width: 15 },
        ];
        data = members.map(m => ({
          fullName: m.fullName,
          registrationNumber: m.registrationNumber,
          course: m.course,
          section: m.section,
          role: m.role,
          email: m.email,
          phone: m.phone,
          whatsapp: m.whatsapp,
          status: m.status
        }));
        break;

      case 'join-requests':
        const joinFilter = status && status !== 'All' ? { status } : {};
        const requests = await JoinUs.find(joinFilter).sort({ createdAt: -1 });
        columns = [
          { header: 'Full Name', key: 'fullName', width: 25 },
          { header: 'Reg Number', key: 'registrationNumber', width: 15 },
          { header: 'Course', key: 'course', width: 15 },
          { header: 'Section', key: 'section', width: 10 },
          { header: 'Email', key: 'email', width: 25 },
          { header: 'Phone', key: 'phone', width: 15 },
          { header: 'Status', key: 'status', width: 15 },
        ];
        data = requests.map(r => ({
          fullName: r.fullName,
          registrationNumber: r.registrationNumber,
          course: r.course,
          section: r.section,
          email: r.email,
          phone: r.phone,
          status: r.status
        }));
        break;

      case 'contact-queries':
        const contactFilter = status && status !== 'All' ? { status } : {};
        const queries = await Contact.find(contactFilter).sort({ createdAt: -1 });
        columns = [
          { header: 'Name', key: 'name', width: 20 },
          { header: 'Email', key: 'email', width: 25 },
          { header: 'Subject', key: 'subject', width: 30 },
          { header: 'Message', key: 'message', width: 50 },
          { header: 'Status', key: 'status', width: 15 },
          { header: 'Date', key: 'date', width: 20 },
        ];
        data = queries.map(q => ({
          name: q.name,
          email: q.email,
          subject: q.subject,
          message: q.message,
          status: q.status,
          date: new Date(q.createdAt).toLocaleDateString()
        }));
        break;

      case 'event-registrations':
        if (!eventId) return res.status(400).json({ message: 'Event ID is required for event registrations export' });
        
        const eventFilter = { eventId };
        if (status && status !== 'All') eventFilter.status = status;
        
        const registrations = await EventRegistration.find(eventFilter).populate('eventId', 'title date').sort({ createdAt: -1 });
        
        if (registrations.length > 0) {
          filename = `event_${eventId}_export_${new Date().toISOString().slice(0, 10)}`;
        }

        columns = [
          { header: 'Reg Number', key: 'registrationNumber', width: 15 },
          { header: 'Full Name', key: 'fullName', width: 25 },
          { header: 'Course', key: 'course', width: 15 },
          { header: 'Section', key: 'section', width: 10 },
          { header: 'Email', key: 'email', width: 25 },
          { header: 'Phone', key: 'phone', width: 15 },
          { header: 'WhatsApp', key: 'whatsapp', width: 15 },
          { header: 'Status', key: 'status', width: 15 },
          { header: 'Date', key: 'date', width: 20 },
        ];
        
        data = registrations.map(r => ({
          registrationNumber: r.registrationNumber,
          fullName: r.fullName,
          course: r.course,
          section: r.section,
          email: r.email,
          phone: r.phone,
          whatsapp: r.whatsapp || (r.hasWhatsapp ? r.phone : ''),
          status: r.status,
          date: new Date(r.createdAt).toLocaleDateString()
        }));
        break;

      default:
        return res.status(400).json({ message: 'Invalid resource specified' });
    }

    // Generate output based on format
    if (format === 'excel' || format === 'csv') {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Data');
      
      worksheet.columns = columns;
      worksheet.addRows(data);
      
      // Style headers
      worksheet.getRow(1).font = { bold: true };
      
      if (format === 'excel') {
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=${filename}.xlsx`);
        await workbook.xlsx.write(res);
      } else {
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=${filename}.csv`);
        await workbook.csv.write(res);
      }
      return res.end();
    } 
    else if (format === 'pdf') {
      const doc = new PDFDocument({ margin: 30, size: 'A4', layout: 'landscape' });
      
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=${filename}.pdf`);
      
      doc.pipe(res);
      
      // Basic PDF formatting (real table libraries are better, but this works for simple text)
      doc.fontSize(16).text(`Export: ${resource.toUpperCase()}`, { align: 'center' });
      doc.moveDown();
      
      // Build a simple string representation for each row since PDFKit doesn't have native tables
      doc.fontSize(10);
      const headers = columns.map(c => c.header).join(' | ');
      doc.font('Helvetica-Bold').text(headers);
      doc.moveDown(0.5);
      
      doc.font('Helvetica');
      data.forEach(row => {
        const rowStr = columns.map(c => {
          let val = row[c.key] || '';
          // truncate long text for PDF
          if (val.length > 30) val = val.substring(0, 27) + '...';
          return val;
        }).join(' | ');
        doc.text(rowStr);
      });
      
      doc.end();
    } else {
      return res.status(400).json({ message: 'Invalid format specified' });
    }

  } catch (error) {
    console.error('Export Error:', error);
    res.status(500).json({ message: 'Error generating export' });
  }
};
