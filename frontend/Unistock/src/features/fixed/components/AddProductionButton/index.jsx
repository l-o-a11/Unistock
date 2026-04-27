/**
 * @file AddProductionButton/index.jsx
 * CAMBIOS:
 *  - Botón PDF → icono de descarga (sin texto)
 *  - Modal que pregunta PDF o Excel antes de descargar
 */
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import ProductionForm from "../ProductionForm";
import Alert from "../../../shared/components/Alert";
import Button from "../../../shared/components/Button";

const AddProductionButton = ({ productions = [], onCreateProduction, onFilterByDate }) => {
  const navigate = useNavigate();
  const [showCreateForm,    setShowCreateForm]    = useState(false);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [alertConfig, setAlertConfig] = useState({ open: false, type: "success", title: "", message: "", onConfirm: null });

  const createProduction = (data) => { if (onCreateProduction) onCreateProduction(data); setShowCreateForm(false); };

  /* ─── PDF ──────────────────────────────────────────────────────────────── */
  const handleDownloadPdf = async () => {
    setShowDownloadModal(false);
    try {
      const { jsPDF } = await import("jspdf");
      const autoTable = (await import("jspdf-autotable")).default;
      const doc = new jsPDF({ unit: "mm", format: "a4" });
      const pageW = doc.internal.pageSize.getWidth();
      const pageH = doc.internal.pageSize.getHeight();
      const M = 14;
      const C = { pink:[236,72,153], pinkBg:[252,231,243], pinkText:[190,24,93], grayHead:[245,245,247], grayText:[55,65,81], grayLight:[156,163,175], border:[229,231,235], white:[255,255,255], redBg:[254,226,226], redText:[185,28,28] };
      const today = new Date().toLocaleDateString("es-CO", { day:"2-digit", month:"long", year:"numeric" });
      doc.setFillColor(...C.pink); doc.rect(0,0,pageW,30,"F");
      doc.setFont("helvetica","bold"); doc.setFontSize(17); doc.setTextColor(...C.white);
      doc.text("Órdenes de Producción", M, 16);
      doc.setFontSize(8); doc.setFont("helvetica","normal");
      doc.text(`Generado: ${today}`, pageW-M, 16, {align:"right"});
      const total=productions.length, activas=productions.filter(p=>p.status!=="Anulada").length, anuladas=total-activas;
      doc.text(`Total: ${total}   Activas: ${activas}   Anuladas: ${anuladas}`, M, 24);
      let y = 38;
      productions.forEach((prod, idx) => {
        const details=Array.isArray(prod.details)?prod.details:[];
        const history=Array.isArray(prod.history)?prod.history:[];
        const anulEntry=[...history].reverse().find(h=>h.status==="Anulada");
        const needed=30+(details.length>0?18+details.length*8:0)+(anulEntry?14:0)+8;
        if(y+needed>pageH-20){doc.addPage();y=18;}
        doc.setFillColor(...C.grayHead); doc.roundedRect(M,y,pageW-M*2,11,2,2,"F");
        doc.setFont("helvetica","bold"); doc.setFontSize(10); doc.setTextColor(...C.grayText);
        doc.text(`Orden #${prod.orderNumber}  ·  ${prod.client||"—"}`, M+3, y+7.5);
        const bW=42,bX=pageW-M-bW;
        doc.setFillColor(...C.pinkBg); doc.roundedRect(bX,y+1.5,bW,8,2,2,"F");
        doc.setFontSize(8); doc.setTextColor(...C.pinkText);
        doc.text(String(prod.status||"—"), bX+bW/2, y+7, {align:"center"});
        y+=14;
        autoTable(doc,{startY:y,margin:{left:M,right:M},head:[["Producto / Artículo","Cantidad","Color","Fecha entrega","Fecha estado"]],body:[[String(prod.producto??prod.referencia??"N/A"),String(prod.quantity??prod.cantidad??"N/A"),String(prod.color??"N/A"),String(prod.deliveryDate??prod.fechaEntrega??"N/A"),String(prod.statusDate??prod.fechaEstado??"N/A")]],headStyles:{fillColor:[...C.grayHead],textColor:[...C.grayLight],fontStyle:"bold",fontSize:8,cellPadding:2.5,lineColor:[...C.border],lineWidth:0.2},bodyStyles:{fontSize:9,textColor:[...C.grayText],cellPadding:3,lineColor:[...C.border],lineWidth:0.2},theme:"plain"});
        y=doc.lastAutoTable.finalY+2;
        if(details.length>0){
          doc.setFontSize(7.5);doc.setFont("helvetica","bold");doc.setTextColor(...C.grayLight);
          doc.text("ARTÍCULOS",M+3,y+4);y+=7;
          autoTable(doc,{startY:y,margin:{left:M+4,right:M},head:[["Ref_corte","Ref","Estado","Fecha","Cantidad","Color"]],body:details.map(d=>[String(d.refCorte??"N/A"),String(d.ref??"N/A"),String(d.status??"N/A"),String(d.statusDate??"N/A"),String(d.quantity??"N/A"),String(d.color??"N/A")]),headStyles:{fillColor:[243,244,246],textColor:[...C.grayLight],fontStyle:"bold",fontSize:7,cellPadding:2,lineColor:[...C.border],lineWidth:0.2},bodyStyles:{fontSize:8,textColor:[...C.grayText],cellPadding:2,lineColor:[...C.border],lineWidth:0.2},theme:"plain"});
          y=doc.lastAutoTable.finalY+2;
        }
        if(anulEntry&&anulEntry.motivo){
          if(y+14>pageH-20){doc.addPage();y=18;}
          doc.setFillColor(...C.redBg);doc.roundedRect(M,y,pageW-M*2,12,2,2,"F");
          doc.setFontSize(8);doc.setFont("helvetica","bold");doc.setTextColor(...C.redText);
          doc.text(`Anulada el ${anulEntry.date}  |  Motivo: `,M+3,y+8);
          doc.setFont("helvetica","normal");
          const lw=doc.getTextWidth(`Anulada el ${anulEntry.date}  |  Motivo: `);
          doc.text(String(anulEntry.motivo),M+3+lw,y+8);y+=15;
        }
        y+=5;
        if(idx<productions.length-1){doc.setDrawColor(...C.border);doc.setLineWidth(0.3);doc.line(M,y-2,pageW-M,y-2);y+=2;}
      });
      const totalPages=doc.internal.getNumberOfPages();
      for(let i=1;i<=totalPages;i++){doc.setPage(i);doc.setDrawColor(...C.pink);doc.setLineWidth(0.4);doc.line(M,pageH-14,pageW-M,pageH-14);doc.setFont("helvetica","normal");doc.setFontSize(7);doc.setTextColor(...C.grayLight);doc.text("Sistema de Gestión de Producción",M,pageH-8);doc.text(`Página ${i} de ${totalPages}`,pageW-M,pageH-8,{align:"right"});}
      doc.save("ordenes_produccion.pdf");
    } catch(err){
      console.error("Error PDF:", err);
      setAlertConfig({open:true,type:"error",title:"Error al generar PDF",message:"Verifica que jspdf y jspdf-autotable estén instalados.",onConfirm:null});
    }
  };

  /* ─── Excel ──────────────────────────────────────────────────────────────── */
  const handleDownloadExcel = async () => {
    setShowDownloadModal(false);
    try {
      const XLSX = await import("xlsx");
      const today = new Date().toLocaleDateString("es-CO", { day: "2-digit", month: "long", year: "numeric" });

      // Hoja principal: órdenes
      const rows = productions.map(prod => ({
        "# Orden":        prod.orderNumber ?? "—",
        "Producto":       prod.producto ?? prod.referencia ?? "—",
        "Referencia":     prod.referencia ?? "—",
        "Cantidad (uds)": prod.quantity ?? prod.cantidad ?? "—",
        "Color":          prod.color ?? "—",
        "Cliente":        prod.client ?? "—",
        "Estado":         prod.status ?? "—",
        "Fecha entrega":  prod.deliveryDate ?? prod.fechaEntrega ?? "—",
        "Fecha estado":   prod.statusDate ?? prod.fechaEstado ?? "—",
        "Prioridad":      prod.prioridad ?? prod.priority ?? "—",
        "Tipo":           prod.tipo ?? "produccion",
      }));

      const ws = XLSX.utils.json_to_sheet(rows);

      // Anchos de columna para mejor lectura
      ws['!cols'] = [
        { wch: 10 }, { wch: 32 }, { wch: 14 }, { wch: 16 },
        { wch: 14 }, { wch: 22 }, { wch: 16 }, { wch: 16 },
        { wch: 16 }, { wch: 12 }, { wch: 12 },
      ];

      // Hoja de artículos (detalles)
      const detallesRows = [];
      productions.forEach(prod => {
        (prod.details || []).forEach(d => {
          detallesRows.push({
            "# Orden":       prod.orderNumber ?? "—",
            "Cliente":       prod.client ?? "—",
            "Ref_corte":     d.refCorte ?? "—",
            "Referencia":    d.ref ?? "—",
            "Cantidad (uds)":d.quantity ?? "—",
            "Color":         d.color ?? "—",
            "Estado":        d.status ?? "—",
            "Fecha estado":  d.statusDate ?? "—",
          });
        });
      });
      const wsDetalles = XLSX.utils.json_to_sheet(detallesRows.length ? detallesRows : [{ Nota: "Sin artículos" }]);
      wsDetalles['!cols'] = [{ wch:10 },{ wch:22 },{ wch:18 },{ wch:14 },{ wch:16 },{ wch:14 },{ wch:16 },{ wch:16 }];

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Órdenes");
      XLSX.utils.book_append_sheet(wb, wsDetalles, "Artículos");
      XLSX.writeFile(wb, `ordenes_produccion_${new Date().toISOString().split('T')[0]}.xlsx`);
    } catch(err){
      console.error("Error Excel:", err);
      setAlertConfig({open:true,type:"error",title:"Error al generar Excel",message:"Verifica que la librería xlsx esté instalada.",onConfirm:null});
    }
  };

  /* ─── Icons ──────────────────────────────────────────────────────────────── */
  const CalendarIcon = () => (<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>);
  const DownloadIcon = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>);

  const overlayStyle = { position:"fixed", inset:0, backgroundColor:"rgba(0,0,0,0.5)", display:"flex", justifyContent:"center", alignItems:"center", zIndex:1050 };

  return (
    <>
      <Alert isOpen={alertConfig.open} type={alertConfig.type} title={alertConfig.title} message={alertConfig.message} onConfirm={()=>setAlertConfig(p=>({...p,open:false}))} onCancel={()=>setAlertConfig(p=>({...p,open:false}))} />

      {/* Barra de botones */}
      <div style={{ display:"flex", alignItems:"center", gap:"8px" }}>

        {/* AGREGAR */}
        <Button variant="primary" onClick={()=>setShowCreateForm(true)} style={{backgroundColor:"#FF4FD6",borderColor:"#FF4FD6",color:"#fff"}} icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>}>
          Agregar
        </Button>

        {/* DESCARGA — solo icono */}
        <button
          onClick={()=>setShowDownloadModal(true)}
          title="Descargar reporte (PDF o Excel)"
          style={{ display:"flex", alignItems:"center", justifyContent:"center", width:36, height:36, borderRadius:9, border:"1.5px solid #e5e7eb", background:"#fff", color:"#6b7280", cursor:"pointer", transition:"all 0.15s" }}
          onMouseEnter={e=>{ e.currentTarget.style.borderColor="#FF4FD6"; e.currentTarget.style.color="#FF4FD6"; e.currentTarget.style.background="#fff0fb"; }}
          onMouseLeave={e=>{ e.currentTarget.style.borderColor="#e5e7eb"; e.currentTarget.style.color="#6b7280"; e.currentTarget.style.background="#fff"; }}
        ><DownloadIcon /></button>

        {/* CALENDARIO */}
        <button
          onClick={()=>navigate("/layout/produccion/calendario")}
          title="Ir al calendario"
          style={{ display:"flex",alignItems:"center",gap:6,padding:"7px 13px",borderRadius:9,border:"1.5px solid #e5e7eb",background:"#fff",color:"#6b7280",fontSize:12,fontWeight:600,cursor:"pointer",transition:"all 0.15s" }}
          onMouseEnter={e=>{ e.currentTarget.style.borderColor="#FF4FD6"; e.currentTarget.style.color="#FF4FD6"; }}
          onMouseLeave={e=>{ e.currentTarget.style.borderColor="#e5e7eb"; e.currentTarget.style.color="#6b7280"; }}
        >
          <CalendarIcon />
          Calendario
        </button>
      </div>

      {/* MODAL PDF / EXCEL */}
      {showDownloadModal && (
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.45)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1200}} onClick={()=>setShowDownloadModal(false)}>
          <div style={{background:"#fff",borderRadius:18,padding:"clamp(16px, 4vw, 28px)",width:"calc(100vw - 32px)",maxWidth:340,boxShadow:"0 20px 60px rgba(0,0,0,0.18)"}} onClick={e=>e.stopPropagation()}>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:20}}>
              <div style={{width:40,height:40,borderRadius:11,background:"#fff0fb",display:"flex",alignItems:"center",justifyContent:"center"}}><DownloadIcon /></div>
              <div>
                <p style={{margin:0,fontSize:15,fontWeight:800,color:"#111827"}}>Descargar reporte</p>
                <p style={{margin:0,fontSize:11,color:"#9ca3af"}}>Selecciona el formato</p>
              </div>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              {/* PDF */}
              <button onClick={handleDownloadPdf}
                style={{display:"flex",alignItems:"center",gap:14,padding:"14px 16px",borderRadius:12,border:"1.5px solid #e5e7eb",background:"#fafafa",cursor:"pointer",textAlign:"left",transition:"all 0.15s"}}
                onMouseEnter={e=>{e.currentTarget.style.borderColor="#ef4444";e.currentTarget.style.background="#fff5f5";}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor="#e5e7eb";e.currentTarget.style.background="#fafafa";}}>
                <div style={{width:38,height:38,borderRadius:9,background:"#fee2e2",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14,2 14,8 20,8"/><line x1="12" y1="18" x2="12" y2="12"/><polyline points="9,15 12,18 15,15"/></svg>
                </div>
                <div>
                  <p style={{margin:0,fontSize:13,fontWeight:700,color:"#1f2937"}}>Descargar PDF</p>
                  <p style={{margin:0,fontSize:11,color:"#9ca3af"}}>Reporte visual con tablas formateadas</p>
                </div>
              </button>
              {/* Excel */}
              <button onClick={handleDownloadExcel}
                style={{display:"flex",alignItems:"center",gap:14,padding:"14px 16px",borderRadius:12,border:"1.5px solid #e5e7eb",background:"#fafafa",cursor:"pointer",textAlign:"left",transition:"all 0.15s"}}
                onMouseEnter={e=>{e.currentTarget.style.borderColor="#16a34a";e.currentTarget.style.background="#f0fdf4";}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor="#e5e7eb";e.currentTarget.style.background="#fafafa";}}>
                <div style={{width:38,height:38,borderRadius:9,background:"#dcfce7",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14,2 14,8 20,8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="16" y2="17"/></svg>
                </div>
                <div>
                  <p style={{margin:0,fontSize:13,fontWeight:700,color:"#1f2937"}}>Descargar Excel</p>
                  <p style={{margin:0,fontSize:11,color:"#9ca3af"}}>Hoja de cálculo editable (.xlsx)</p>
                </div>
              </button>
            </div>
            <button onClick={()=>setShowDownloadModal(false)} style={{marginTop:16,width:"100%",padding:"9px 0",borderRadius:10,border:"1.5px solid #e5e7eb",background:"#fff",color:"#6b7280",fontSize:13,fontWeight:600,cursor:"pointer"}}>Cancelar</button>
          </div>
        </div>
      )}

      {/* MODAL CREAR ORDEN */}
      {showCreateForm && (
        <div style={overlayStyle} onClick={()=>setShowCreateForm(false)}>
          <div style={{background:"#fff",borderRadius:12,width:"92%",maxWidth:660,maxHeight:"90vh",overflowY:"auto"}} onClick={e=>e.stopPropagation()}>
            <ProductionForm onSubmit={createProduction} onCancel={()=>setShowCreateForm(false)} />
          </div>
        </div>
      )}
    </>
  );
};

export default AddProductionButton;
