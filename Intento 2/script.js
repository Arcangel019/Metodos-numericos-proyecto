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
    const expression = document.getElementById('function').value
        .replace(/\^/g, '**')
        .replace(/x/g, `(${x})`);
    return eval(expression);
}

function secantMethod(x0, x1, tolerance, maxIter) {
    let results = [];
    let x2;
    
    for (let i = 0; i < maxIter; i++) {
        const fx0 = f(x0);
        const fx1 = f(x1);
        
        if (Math.abs(fx1 - fx0) < 1e-10) break;
        
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
    
    return results;
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
        points.push({x: x, y: f(x)});
    }
    const yValues = points.map(p => p.y);
    const minY = Math.min(...yValues);
    const maxY = Math.max(...yValues);
    
    // Funciones de transformación para mapear coordenadas matemáticas a coordenadas del canvas
    const transformX = (x) => padding + (x - minX) * (width - 2 * padding) / (maxX - minX);
    const transformY = (y) => height - (padding + (y - minY) * (height - 2 * padding) / (maxY - minY));
    
    // Limpiar canvas
    ctx.clearRect(0, 0, width, height);
    
    // Dibujar ejes
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
    
    // Dibujar la cuadrícula
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 0.5;
    
    // Líneas verticales de la cuadrícula
    for (let x = minX; x <= maxX; x++) {
        const xPos = transformX(x);
        ctx.beginPath();
        ctx.moveTo(xPos, padding);
        ctx.lineTo(xPos, height - padding);
        ctx.stroke();
        
        // Etiquetas del eje X
        ctx.fillStyle = '#666';
        ctx.textAlign = 'center';
        ctx.fillText(x.toFixed(1), xPos, height - padding + 15);
    }
    
    // Líneas horizontales de la cuadrícula
    for (let y = Math.floor(minY); y <= Math.ceil(maxY); y++) {
        const yPos = transformY(y);
        ctx.beginPath();
        ctx.moveTo(padding, yPos);
        ctx.lineTo(width - padding, yPos);
        ctx.stroke();
        
        // Etiquetas del eje Y
        ctx.fillStyle = '#666';
        ctx.textAlign = 'right';
        ctx.fillText(y.toFixed(1), padding - 5, yPos + 4);
    }
    
    // Dibujar la función
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
    const lastResult = results[results.length - 1];
    document.getElementById('finalResult').textContent = lastResult.x2.toFixed(9);
    document.getElementById('finalError').textContent = lastResult.error.toFixed(9);
    document.getElementById('totalIterations').textContent = results.length;
}

function calculate() {
    const x0 = parseFloat(document.getElementById('x0').value);
    const x1 = parseFloat(document.getElementById('x1').value);
    const tolerance = parseFloat(document.getElementById('tolerance').value);
    const maxIter = parseInt(document.getElementById('maxIter').value);
    
    try {
        const results = secantMethod(x0, x1, tolerance, maxIter);
        window.lastResults = results; // Guardar resultados para redibujado
        updateResult(results);
        updateTable(results);
        
        const canvas = document.getElementById('functionGraph');
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
        const ctx = canvas.getContext('2d');
        drawFunction(ctx, results);
    } catch (error) {
        alert('Error al calcular: ' + error.message);
    }
}

// Evento para manejar el Enter en el input de la función
document.getElementById('function').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        calculate();
    }
});