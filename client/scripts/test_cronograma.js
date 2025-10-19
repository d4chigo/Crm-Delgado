// Standalone JS port of the calcularCronogramaPagos logic for local testing
function calcularCuotaMensual(monto, tasaAnual, plazoMeses) {
  if (monto <= 0 || plazoMeses <= 0) return 0;
  if (tasaAnual === 0) return Math.round((monto / plazoMeses) * 100) / 100;
  const tasaMensual = tasaAnual / 100 / 12;
  const factor = Math.pow(1 + tasaMensual, plazoMeses);
  const cuota = monto * (tasaMensual * factor) / (factor - 1);
  return Math.round(cuota * 100) / 100;
}

function calcularCronogramaPagos(monto, tasaAnual, plazoMeses, options) {
  if (monto <= 0 || tasaAnual < 0 || plazoMeses <= 0) return [];
  let cuota = calcularCuotaMensual(monto, tasaAnual, plazoMeses);
  let saldo = monto;
  const cronograma = [];
  const freqToMonths = { TRIMESTRAL: 3, SEMESTRAL: 6, ANUAL: 12 };
  const extraTipo = options?.cuotaEspecialTipo;
  const extraValor = options?.cuotaEspecialValor ?? 0;
  const freq = options?.frecuenciaCuotaEspecial ? freqToMonths[options.frecuenciaCuotaEspecial] : null;
  const overrides = {};
  if (options?.flexibleOverridesText) {
    options.flexibleOverridesText.split(/\r?\n/).forEach(line => {
      const parts = line.split(':').map(p => p.trim());
      const m = parseInt(parts[0], 10);
      const v = parseFloat(parts[1]);
      if (!isNaN(m) && !isNaN(v)) overrides[m] = v;
    });
  }
  const modalidad = options?.modalidadPago || 'FIJA';
  const tasaMensual = tasaAnual === 0 ? 0 : tasaAnual / 100 / 12;
  const graciaMeses = options?.periodoGraciaMeses ?? 0;
  const graciaTipo = options?.periodoGraciaTipo;

  for (let mes = 1; mes <= plazoMeses; mes++) {
    const interes = Math.round(saldo * tasaMensual * 100) / 100;
    let cuotaMes = Math.round(cuota * 100) / 100;
    let pagoEspecial = 0;
    let pagoEspecialAplicado = 0;
    let pagoEspecialNoUtilizado = 0;
    let esCuotaEspecial = false;

    if (modalidad === 'GRACIA' && mes <= graciaMeses) {
      if (graciaTipo === 'SIN_PAGO') {
        const capital = 0;
        const cuotaRegistro = 0;
        const nuevoSaldo = Math.round((saldo + interes) * 100) / 100;
        cronograma.push({ mes, cuota: cuotaRegistro, cuotaBase: 0, pagoEspecial: 0, pagoEspecialAplicado: 0, pagoEspecialNoUtilizado: 0, interes, capital, saldo: nuevoSaldo, esCuotaEspecial: false, nota: 'Periodo de gracia (sin pago)'});
        saldo = nuevoSaldo;
        continue;
      }
      if (graciaTipo === 'SOLO_INTERES') {
        const capital = 0;
        const cuotaRegistro = interes;
        cronograma.push({ mes, cuota: cuotaRegistro, cuotaBase: 0, pagoEspecial: 0, pagoEspecialAplicado: 0, pagoEspecialNoUtilizado: 0, interes, capital, saldo: saldo, esCuotaEspecial: false, nota: 'Periodo de gracia (solo interés)'});
        continue;
      }
    }

    if (modalidad === 'FLEXIBLE_TRADICIONAL' && overrides[mes] !== undefined) {
      cuotaMes = Math.round(overrides[mes] * 100) / 100;
      esCuotaEspecial = false;
    }

    if (modalidad === 'ESCALONADA') {
      if (options?.escalonadoIncrementoMensual) {
        const inc = options.escalonadoIncrementoMensual;
        cuotaMes = Math.round((cuota + inc * (mes - 1)) * 100) / 100;
      }
      if (options?.escalonadoPorcentaje && options?.escalonadoCadaMeses) {
        const bloques = Math.floor((mes - 1) / options.escalonadoCadaMeses);
        const factor = Math.pow(1 + options.escalonadoPorcentaje / 100, bloques);
        cuotaMes = Math.round((cuota * factor) * 100) / 100;
      }
    }

    if ((modalidad === 'FLEXIBLE_ESPECIAL' || (modalidad === 'FIJA' && freq)) && freq && freq > 0 && mes % freq === 0) {
      esCuotaEspecial = true;
      if (extraTipo === 'FIJO') {
        pagoEspecial = Math.round(extraValor * 100) / 100;
      } else if (extraTipo === 'PORCENTAJE') {
        const cuotaBaseRounded = Math.round(cuota * 100) / 100;
        const cuotaTotalDeseada = Math.round(cuotaBaseRounded * (extraValor / 100) * 100) / 100;
        pagoEspecial = Math.round((cuotaTotalDeseada - cuotaBaseRounded) * 100) / 100;
      }
      pagoEspecialAplicado = pagoEspecial;
      cuotaMes = Math.round((cuotaMes + pagoEspecial) * 100) / 100;
    }

    let capital = Math.round((cuotaMes - interes) * 100) / 100;
    const adeudado = Math.round((saldo + interes) * 100) / 100;

    if (cuotaMes > adeudado) {
      const cuotaOriginal = cuotaMes;
      cuotaMes = adeudado;
      capital = Math.round((cuotaMes - interes) * 100) / 100;
      const cuotaBaseRounded = Math.round(cuota * 100) / 100;
      const aplicado = Math.max(0, Math.min(pagoEspecial, Math.round((cuotaMes - cuotaBaseRounded) * 100) / 100));
      pagoEspecialAplicado = Math.round(aplicado * 100) / 100;
      pagoEspecialNoUtilizado = Math.round((pagoEspecial - pagoEspecialAplicado) * 100) / 100;
    }

    saldo = Math.round((saldo - capital) * 100) / 100;

    cronograma.push({ mes, cuota: cuotaMes, cuotaBase: Math.round(cuota * 100) / 100, pagoEspecial, pagoEspecialAplicado, pagoEspecialNoUtilizado, interes, capital, saldo: saldo < 0.01 ? 0 : saldo, esCuotaEspecial });

    if (saldo <= 0) break;

    if (modalidad === 'FLEXIBLE_TRADICIONAL' && overrides[mes] !== undefined) {
      const mesesRestantes = plazoMeses - mes;
      if (mesesRestantes > 0) cuota = calcularCuotaMensual(saldo, tasaAnual, mesesRestantes);
    }

    if (modalidad === 'GRACIA' && graciaMeses > 0 && mes === graciaMeses) {
      const mesesRestantes = plazoMeses - mes;
      if (mesesRestantes > 0) cuota = calcularCuotaMensual(saldo, tasaAnual, mesesRestantes);
    }
  }

  return cronograma;
}

// Use the specific scenario you pasted. Recreate the values to reproduce the problem.
// From the table: base cuota S/1041.67, no interest, several semestral specials of S/6041.67 were intended.
// We'll simulate: monto original must be 50000 (because saldo after 1 is 48958.33), plazo 29 producing those numbers.

const monto = 50000;
const tasaAnual = 0; // no interest as in your table
const plazo = 29; // you showed months up to 29
const options = {
  modalidadPago: 'FLEXIBLE_ESPECIAL',
  frecuenciaCuotaEspecial: 'SEMESTRAL',
  cuotaEspecialTipo: 'FIJO',
  cuotaEspecialValor: 504.17 // note: to get 6041.67 they'd have added 5000? We'll try 5000
};

const cron = calcularCronogramaPagos(monto, tasaAnual, plazo, { modalidadPago: 'FLEXIBLE_ESPECIAL', frecuenciaCuotaEspecial: 'SEMESTRAL', cuotaEspecialTipo: 'FIJO', cuotaEspecialValor: 5000 });

console.table(cron.map(r => ({ Mes: r.mes, Cuota: r.cuota.toFixed(2), Especial: r.esCuotaEspecial ? `Aplicado: ${r.pagoEspecialAplicado?.toFixed(2) || '0.00'}${r.pagoEspecialNoUtilizado ? ' / No usado: ' + r.pagoEspecialNoUtilizado.toFixed(2) : ''}` : '-', Interes: r.interes.toFixed(2), Capital: r.capital.toFixed(2), Saldo: r.saldo.toFixed(2) })));