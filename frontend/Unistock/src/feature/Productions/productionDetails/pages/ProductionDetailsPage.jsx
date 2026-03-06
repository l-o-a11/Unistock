import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ProductionAPI } from "../../services/ProductionAPI";
import Button from "../../../shared/components/Button";
import AlertEditProduction from "../pages/AlertEditProduction";
import ProductionAlerts from "../pages/ProductionAlerts";

const steps = [
  "Diseño",
  "Ficha Técnica",
  "Corte",
  "Compras",
  "Producción",
  "Recepción",
  "Entregado",
];

const EditIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
      d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 112.828 2.828L11.828 15.828A2 2 0 0110 16H8v-2a2 2 0 01.586-1.414z" />
  </svg>
);

const TrashIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7h6m2 0a1 1 0 00-1-1h-4a1 1 0 00-1 1m-4 0h12" />
  </svg>
);

const ProductionDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [production, setProduction] = useState(null);
  const [loading, setLoading] = useState(true);

  // Alert de avance/estado/anular
  const [productionAlert, setProductionAlert] = useState({
    isOpen: false,
    type: "advance",
    targetStep: null,
    tercero: "",
    sede: "",
    customTitle: undefined,
    customMessage: undefined,
    onConfirmOverride: null,
  });

  // Alert de edición
  const [editAlert, setEditAlert] = useState({ isOpen: false, detail: null });

  useEffect(() => {
    const load = async () => {
      try {
        const data = await ProductionAPI.getById(Number(id));
        setProduction(data);
      } catch (err) {
        console.error(err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) return <p className="p-6">Cargando...</p>;
  if (!production) return <p className="p-6">No se encontró la orden</p>;

  const currentStepIndex = steps.indexOf(production.status);
  const progressPercent = Math.round(((currentStepIndex + 1) / steps.length) * 100);
  const nextStep = steps[currentStepIndex + 1];
  const prevStep = steps[currentStepIndex - 1];

  // Determina qué tipo de alerta mostrar según la transición de estado
  const getAlertType = (from, to) => {
    if (from === "Compras" && to === "Producción") return "third";
    if (from === "Producción" && to === "Recepción") return "assignSede";
    return "advance";
  };

  const openProductionAlert = (overrides) => {
    setProductionAlert({
      isOpen: true,
      type: "advance",
      targetStep: null,
      tercero: "",
      sede: "",
      customTitle: undefined,
      customMessage: undefined,
      onConfirmOverride: null,
      ...overrides,
    });
  };

  const closeProductionAlert = () =>
    setProductionAlert((p) => ({ ...p, isOpen: false }));

  const handleNextStep = () => {
    if (!nextStep) return;
    openProductionAlert({
      type: getAlertType(production.status, nextStep),
      targetStep: nextStep,
    });
  };

  const handlePreviousStep = () => {
    if (currentStepIndex === 0) return;
    openProductionAlert({
      type: "advance",
      targetStep: prevStep,
      customTitle: "Cambiar estado",
      customMessage: `¿Deseas regresar al estado "${prevStep}"?`,
    });
  };

  const handleProductionAlertConfirm = () => {
    if (productionAlert.onConfirmOverride) {
      productionAlert.onConfirmOverride();
      return;
    }
    console.log(`Estado cambiado a: ${productionAlert.targetStep}`, {
      tercero: productionAlert.tercero,
      sede: productionAlert.sede,
    });
    closeProductionAlert();
  };

  const handleEditConfirm = ({ cantidad, color }) => {
    console.log("Editar referencia:", editAlert.detail?.ref, { cantidad, color });
    setEditAlert({ isOpen: false, detail: null });
  };

  const handleAnular = (d) => {
    openProductionAlert({
      type: "advance",
      customTitle: "Anular referencia",
      customMessage: `¿Deseas anular la referencia ${d.ref}?`,
      onConfirmOverride: () => {
        console.log("Anular referencia:", d.ref);
        closeProductionAlert();
      },
    });
  };

  const handleSaveChanges = () => {
    openProductionAlert({
      type: "advance",
      customTitle: "Guardar cambios",
      customMessage: "¿Deseas guardar los cambios realizados?",
      onConfirmOverride: () => {
        console.log("Guardar cambios");
        closeProductionAlert();
      },
    });
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen" style={{ fontFamily: "'Nunito', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800&display=swap" rel="stylesheet" />

      {/* ALERTA DE PRODUCCIÓN */}
      <ProductionAlerts
        isOpen={productionAlert.isOpen}
        type={productionAlert.type}
        targetStep={productionAlert.targetStep}
        tercero={productionAlert.tercero}
        sede={productionAlert.sede}
        onChangeTercero={(v) => setProductionAlert((p) => ({ ...p, tercero: v }))}
        onChangeSede={(v) => setProductionAlert((p) => ({ ...p, sede: v }))}
        customTitle={productionAlert.customTitle}
        customMessage={productionAlert.customMessage}
        onAccept={handleProductionAlertConfirm}
        onCancel={closeProductionAlert}
      />

      {/* ALERTA DE EDICIÓN */}
      <AlertEditProduction
        isOpen={editAlert.isOpen}
        detail={editAlert.detail}
        onAccept={handleEditConfirm}
        onCancel={() => setEditAlert({ isOpen: false, detail: null })}
      />

      {/* BOTÓN VOLVER */}
      <Button variant="secondary" onClick={() => navigate("/layout/produccion")} className="mb-4">
        ← Volver a Producciones
      </Button>

      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-semibold">Orden #{production.orderNumber}</h2>
          <span className="px-3 py-1 rounded-full text-xs bg-pink-200 text-pink-700">
            {production.status}
          </span>
        </div>
        <Button onClick={handleSaveChanges}>Guardar cambios</Button>
      </div>

      {/* BARRA PROGRESO */}
      <div className="bg-white rounded-xl p-4 shadow mb-6">
        <div className="flex justify-between text-sm mb-2">
          <span>Proceso general de producción</span>
          <span className="text-pink-500 font-semibold">{progressPercent}%</span>
        </div>
        <div className="h-2 bg-pink-100 rounded overflow-hidden">
          <div className="h-full bg-pink-500 transition-all duration-500" style={{ width: `${progressPercent}%` }} />
        </div>
        <p className="text-xs mt-2 text-gray-500">
          Siguiente etapa: <span className="font-medium">{nextStep || "Completado ✓"}</span>
        </p>
      </div>

      {/* STEPPER */}
      <div className="bg-white p-6 rounded-xl shadow mb-6">
        <div className="relative flex justify-between items-center">
          <div className="absolute top-3 left-0 right-0 h-[2px] bg-gray-200" />
          <div
            className="absolute top-3 left-0 h-[2px] bg-green-500 transition-all duration-500"
            style={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}
          />
          {steps.map((step, i) => {
            const completed = i < currentStepIndex;
            const current = i === currentStepIndex;
            return (
              <div key={i} className="flex flex-col items-center relative z-10 flex-1">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
                  ${current ? "bg-pink-500 text-white" : completed ? "bg-green-500 text-white" : "bg-gray-200 text-gray-400"}`}>
                  {completed ? "✓" : current ? "●" : ""}
                </div>
                <span className={`text-xs mt-1 ${current ? "text-pink-500 font-semibold" : "text-gray-400"}`}>
                  {step}
                </span>
              </div>
            );
          })}
        </div>

        <div className="bg-pink-50 p-4 rounded-lg mt-6">
          <strong className="text-pink-600">{production.status}</strong>
          <p className="text-sm text-gray-500 mt-1">Última actualización: {production.statusDate}</p>
          <div className="flex gap-2 mt-3">
            <Button variant="secondary" onClick={handlePreviousStep} disabled={currentStepIndex === 0}>
              Anterior
            </Button>
            <Button onClick={handleNextStep} disabled={currentStepIndex === steps.length - 1}>
              Siguiente
            </Button>
          </div>
        </div>
      </div>

      {/* GRID */}
      <div className="grid grid-cols-2 gap-6">

        {/* REFERENCIAS */}
        <div className="bg-white p-4 rounded-xl shadow">
          <h3 className="font-semibold mb-4">Referencia</h3>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-400 text-left border-b border-gray-100 text-xs uppercase tracking-wide">
                <th className="pb-2">Número</th>
                <th className="pb-2">Código</th>
                <th className="pb-2">Cantidad</th>
                <th className="pb-2">Color</th>
                <th className="pb-2">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {production.details?.map((d, i) => (
                <tr key={i} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="py-2">{d.refCorte}</td>
                  <td className="py-2">{d.ref}</td>
                  <td className="py-2">{d.quantity}</td>
                  <td className="py-2">{d.color}</td>
                  <td className="py-2">
                    <div className="flex items-center gap-1">
                      <button
                        className="p-1.5 rounded-lg text-blue-400 hover:bg-blue-50 hover:text-blue-600 transition"
                        onClick={() => setEditAlert({ isOpen: true, detail: d })}
                        title="Editar"
                      >
                        <EditIcon />
                      </button>
                      <button
                        className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 hover:text-red-600 transition"
                        onClick={() => handleAnular(d)}
                        title="Anular"
                      >
                        <TrashIcon />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* HISTORIAL */}
        <div className="bg-white p-4 rounded-xl shadow">
          <h3 className="font-semibold mb-4">Historial</h3>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-400 text-left border-b border-gray-100 text-xs uppercase tracking-wide">
                <th className="pb-2">Estado</th>
                <th className="pb-2">Fecha</th>
                <th className="pb-2">Responsable</th>
              </tr>
            </thead>
            <tbody>
              {production.history?.map((h, i) => (
                <tr key={i} className="border-b border-gray-50">
                  <td className="py-2">
                    <span className="px-2 py-0.5 rounded-full text-xs bg-pink-100 text-pink-600">{h.status}</span>
                  </td>
                  <td className="py-2 text-gray-500">{h.date}</td>
                  <td className="py-2 text-gray-600">{h.user}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* FICHA TÉCNICA */}
      <div className="bg-white p-4 rounded-xl shadow mt-6">
        <div className="flex justify-between items-center">
          <h3 className="font-semibold">Ficha técnica y costos</h3>
          <Button onClick={() => navigate(`/layout/productos/technicalsheet/${id}`)}>
            Ver ficha técnica
          </Button>
        </div>
        <div className="flex justify-between mt-3 text-sm text-gray-600">
          <span>{production.techSpecification?.name || "N/A"}</span>
          <span>Versión {production.techSpecification?.version || "1.0"}</span>
        </div>
        <div className="bg-blue-50 p-3 rounded-lg mt-3 text-sm text-blue-700">
          <p>Costo unidad: <strong>${production.techSpecification?.costPerUnit?.toLocaleString("es-CO")}</strong></p>
          <p className="mt-1">Costo total: <strong>${production.techSpecification?.totalCost?.toLocaleString("es-CO")}</strong></p>
        </div>
      </div>
    </div>
  );
};

export default ProductionDetailsPage;