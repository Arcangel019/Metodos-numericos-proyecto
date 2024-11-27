// Toast notification system
function showToast(message, type = 'error') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast ${type}`;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Input validation
function validateInputs() {
    const functionInput = document.getElementById('function').value.trim();
    const x0 = document.getElementById('x0').value;
    const x1 = document.getElementById('x1').value;
    const tolerance = document.getElementById('tolerance').value;
    const maxIter = document.getElementById('maxIter').value;

    // Validar función
    if (!functionInput) {
        showToast('La función es requerida');
        return false;
    }
    if (!/^[x0-9+\-*/^(). ]+$/.test(functionInput)) {
        showToast('La función contiene caracteres no válidos');
        return false;
    }

    try {
        // Probar si la función es válida
        f(1);
    } catch (error) {
        showToast('La función no es válida. Verifica la sintaxis');
        return false;
    }

    // Validar números
    if (!x0 || isNaN(x0)) {
        showToast('Valor x₀ debe ser un número');
        return false;
    }

    if (!x1 || isNaN(x1)) {
        showToast('Valor x₁ debe ser un número');
        return false;
    }

    if (x0 === x1) {
        showToast('x₀ y x₁ no pueden ser iguales');
        return false;
    }

    if (!tolerance || isNaN(tolerance) || parseFloat(tolerance) <= 0) {
        showToast('Tolerancia debe ser un número positivo');
        return false;
    }

    if (!maxIter || isNaN(maxIter) || parseInt(maxIter) <= 0) {
        showToast('Máximo de iteraciones debe ser un número positivo');
        return false;
    }

    return true;
}

// Evento para manejar el redimensionamiento
window.addEventListener('resize', function() {
    const canvas = document.getElementById('functionGraph');
    if (canvas) {
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
        if (window.lastResults) {
            drawFunction(canvas.getContext('2d'), window.lastResults);
        }
    }
});

function f(x) {
    try {
        const expression = document.getElementById('function').value
            .replace(/\^/g, '**')
            .replace(/x/g, `(${x})`);
        return eval(expression);
    } catch (error) {
        throw new Error('Error al evaluar la función');
    }
}

function secantMethod(x0, x1, tolerance, maxIter) {
    let results = [];
    let x2;
    
    try {
        for (let i = 0; i < maxIter; i++) {
            const fx0 = f(x0);
            const fx1 = f(x1);
            
            if (Math.abs(fx1 - fx0) < 1e-10) {
                showToast('División por cero detectada', 'warning');
                break;
            }
            
            x2 = x1 - fx1 * (x1 - x0) / (fx1 - fx0);
            
            results.push({
                iteration: i,
                x0: x0,
                x1: x1,
                fx0: fx0,
                fx1: fx1,
                x2: x2,
                error: Math.abs(x1 - x0)
            });
            
            if (Math.abs(x2 - x1) < tolerance) break;
            
            x0 = x1;
            x1 = x2;
        }
        
        if (results.length >= maxIter) {
            showToast('Se alcanzó el máximo de iteraciones sin convergencia', 'warning');
        }
        
        return results;
    } catch (error) {
        showToast('Error en el cálculo: ' + error.message);
        return [];
    }
}

function updateTable(results) {
    const tbody = document.querySelector('#resultTable tbody');
    tbody.innerHTML = '';
    
    results.forEach(row => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${row.iteration}</td>
            <td>${row.x0.toFixed(9)}</td>
            <td>${row.x1.toFixed(9)}</td>
            <td>${row.fx0.toFixed(9)}</td>
            <td>${row.fx1.toFixed(9)}</td>
            <td>${row.x2.toFixed(9)}</td>
            <td>${row.error.toFixed(9)}</td>
        `;
        tbody.appendChild(tr);
    });
}

function drawFunction(ctx, results) {
    const width = ctx.canvas.width;
    const height = ctx.canvas.height;
    const padding = 40;
    
    // Calcular el rango de valores x basado en los resultados
    const xValues = results.flatMap(r => [r.x0, r.x1, r.x2]);
    const minX = Math.min(...xValues) - 1;
    const maxX = Math.max(...xValues) + 1;
    
    // Generar puntos para la gráfica
    const points = [];
    for (let i = 0; i <= 100; i++) {
        const x = minX + (i / 100) * (maxX - minX);
        try {
            points.push({x: x, y: f(x)});
        } catch (error) {
            continue;
        }
    }
    const yValues = points.map(p => p.y);
    const minY = Math.min(...yValues);
    const maxY = Math.max(...yValues);
    
    // Funciones de transformación
    const transformX = (x) => padding + (x - minX) * (width - 2 * padding) / (maxX - minX);
    const transformY = (y) => height - (padding + (y - minY) * (height - 2 * padding) / (maxY - minY));
    
    // Limpiar canvas
    ctx.clearRect(0, 0, width, height);
    
    // Dibujar ejes y cuadrícula
    ctx.beginPath();
    ctx.strokeStyle = '#666';
    ctx.lineWidth = 1;
    
    // Eje X
    ctx.moveTo(padding, height - padding);
    ctx.lineTo(width - padding, height - padding);
    
    // Eje Y
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, height - padding);
    ctx.stroke();
    
    // Cuadrícula
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 0.5;
    
    // Líneas verticales
    for (let x = minX; x <= maxX; x++) {
        const xPos = transformX(x);
        ctx.beginPath();
        ctx.moveTo(xPos, padding);
        ctx.lineTo(xPos, height - padding);
        ctx.stroke();
        
        // Etiquetas X
        ctx.fillStyle = '#666';
        ctx.textAlign = 'center';
        ctx.fillText(x.toFixed(1), xPos, height - padding + 15);
    }
    
    // Líneas horizontales
    for (let y = Math.floor(minY); y <= Math.ceil(maxY); y++) {
        const yPos = transformY(y);
        ctx.beginPath();
        ctx.moveTo(padding, yPos);
        ctx.lineTo(width - padding, yPos);
        ctx.stroke();
        
        // Etiquetas Y
        ctx.fillStyle = '#666';
        ctx.textAlign = 'right';
        ctx.fillText(y.toFixed(1), padding - 5, yPos + 4);
    }
    
    // Dibujar función
    ctx.beginPath();
    ctx.strokeStyle = '#00ff88';
    ctx.lineWidth = 2;
    points.forEach((p, i) => {
        if (i === 0) ctx.moveTo(transformX(p.x), transformY(p.y));
        else ctx.lineTo(transformX(p.x), transformY(p.y));
    });
    ctx.stroke();
    
    // Dibujar puntos de iteración
    const pointSize = window.innerWidth < 576 ? 3 : 4;
    ctx.fillStyle = '#ff3366';
    results.forEach(r => {
        ctx.beginPath();
        ctx.arc(transformX(r.x1), transformY(f(r.x1)), pointSize, 0, 2 * Math.PI);
        ctx.fill();
    });
}

function updateResult(results) {
    if (results.length > 0) {
        const lastResult = results[results.length - 1];
        document.getElementById('finalResult').textContent = lastResult.x2.toFixed(9);
        document.getElementById('finalError').textContent = lastResult.error.toFixed(9);
        document.getElementById('totalIterations').textContent = results.length;
    } else {
        document.getElementById('finalResult').textContent = '-';
        document.getElementById('finalError').textContent = '-';
        document.getElementById('totalIterations').textContent = '0';
    }
}

function calculate() {
    if (!validateInputs()) return;
    
    try {
        const x0 = parseFloat(document.getElementById('x0').value);
        const x1 = parseFloat(document.getElementById('x1').value);
        const tolerance = parseFloat(document.getElementById('tolerance').value);
        const maxIter = parseInt(document.getElementById('maxIter').value);
        
        const results = secantMethod(x0, x1, tolerance, maxIter);
        
        if (results.length > 0) {
            window.lastResults = results;
            updateResult(results);
            updateTable(results);
            
            const canvas = document.getElementById('functionGraph');
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
            const ctx = canvas.getContext('2d');
            drawFunction(ctx, results);
            
            showToast('Cálculo completado exitosamente', 'success');
        }
    } catch (error) {
        showToast('Error en el cálculo: ' + error.message);
    }
}

// Event Listeners
document.getElementById('function').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        calculate();
    }
});

// Inicialización
window.addEventListener('load', function() {
    const canvas = document.getElementById('functionGraph');
    if (canvas) {
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
    }
});