import tkinter as tk
from tkinter import ttk, messagebox
import numpy as np
import matplotlib.pyplot as plt
from matplotlib.backends.backend_tkagg import FigureCanvasTkAgg

class SecantCalculator:
    def __init__(self, root):
        self.root = root
        self.root.title("Calculadora Método de la Secante")
        
        # Variables
        self.function_var = tk.StringVar(value="x**2 - 4")
        self.x0_var = tk.StringVar(value="1")
        self.x1_var = tk.StringVar(value="2")
        self.tol_var = tk.StringVar(value="0.0001")
        self.max_iter_var = tk.StringVar(value="20")
        
        # Crear notebook para pestañas
        self.notebook = ttk.Notebook(root)
        self.notebook.pack(expand=True, fill='both', padx=5, pady=5)
        
        # Pestaña calculadora
        self.calc_frame = ttk.Frame(self.notebook)
        self.notebook.add(self.calc_frame, text="Calculadora")
        
        # Pestaña ayuda
        self.help_frame = ttk.Frame(self.notebook)
        self.notebook.add(self.help_frame, text="Ayuda")
        
        # Pestaña acerca de
        self.about_frame = ttk.Frame(self.notebook)
        self.notebook.add(self.about_frame, text="Acerca de")
        
        self.setup_calculator()
        self.setup_help()
        self.setup_about()

    def setup_calculator(self):
        # Marco para entradas
        input_frame = ttk.LabelFrame(self.calc_frame, text="Entradas", padding=10)
        input_frame.grid(row=0, column=0, padx=5, pady=5, sticky="nsew")
        
        ttk.Label(input_frame, text="Función f(x):").grid(row=0, column=0)
        ttk.Entry(input_frame, textvariable=self.function_var).grid(row=0, column=1)
        
        ttk.Label(input_frame, text="x₀:").grid(row=1, column=0)
        ttk.Entry(input_frame, textvariable=self.x0_var).grid(row=1, column=1)
        
        ttk.Label(input_frame, text="x₁:").grid(row=2, column=0)
        ttk.Entry(input_frame, textvariable=self.x1_var).grid(row=2, column=1)
        
        ttk.Label(input_frame, text="Tolerancia:").grid(row=3, column=0)
        ttk.Entry(input_frame, textvariable=self.tol_var).grid(row=3, column=1)
        
        ttk.Label(input_frame, text="Máx. iteraciones:").grid(row=4, column=0)
        ttk.Entry(input_frame, textvariable=self.max_iter_var).grid(row=4, column=1)
        
        ttk.Button(input_frame, text="Calcular", command=self.calculate).grid(row=5, column=0, columnspan=2)

        # Marco para resultados
        self.result_frame = ttk.LabelFrame(self.calc_frame, text="Resultados", padding=10)
        self.result_frame.grid(row=1, column=0, padx=5, pady=5, sticky="nsew")
        
        self.result_text = tk.Text(self.result_frame, height=10, width=50)
        self.result_text.pack(fill='both', expand=True)

        # Marco para gráfica
        self.graph_frame = ttk.LabelFrame(self.calc_frame, text="Gráfica", padding=10)
        self.graph_frame.grid(row=0, column=1, rowspan=2, padx=5, pady=5, sticky="nsew")
        
        self.fig, self.ax = plt.subplots(figsize=(6, 6))
        self.canvas = FigureCanvasTkAgg(self.fig, master=self.graph_frame)
        self.canvas.get_tk_widget().pack(fill='both', expand=True)

    def setup_help(self):
        help_text = """
        Método de la Secante - Instrucciones de Uso

        1. Ingreso de datos:
           - Función f(x): Escriba la función usando sintaxis de Python (ej: x**2 - 4)
           - x₀: Primer valor inicial
           - x₁: Segundo valor inicial
           - Tolerancia: Error máximo aceptable
           - Máx. iteraciones: Número máximo de iteraciones

        2. Operadores válidos:
           - ** para potencia (x**2)
           - * para multiplicación
           - / para división
           - + para suma
           - - para resta

        3. Interpretación de resultados:
           - La tabla muestra cada iteración
           - La gráfica muestra la función y los puntos de iteración
           - El resultado final muestra la raíz encontrada
        """
        help_label = ttk.Label(self.help_frame, text=help_text, wraplength=500, justify="left")
        help_label.pack(padx=10, pady=10)

    def setup_about(self):
        about_text = """
        Calculadora del Método de la Secante v1.0

        Desarrollada con Python y tkinter

        Este programa implementa el método de la secante para encontrar
        raíces de ecuaciones no lineales. El método de la secante es una
        variación del método de Newton-Raphson que no requiere el cálculo
        de derivadas.

        Desarrollador: [Tu Nombre]
        Universidad: [Tu Universidad]
        Fecha: 2024
        """
        about_label = ttk.Label(self.about_frame, text=about_text, wraplength=500, justify="center")
        about_label.pack(padx=10, pady=10)

    def evaluate_function(self, x):
        try:
            return eval(self.function_var.get().replace('x', str(x)))
        except:
            raise ValueError("Error al evaluar la función")

    def secant_method(self, x0, x1, tol, max_iter):
        steps = []
        for i in range(max_iter):
            fx0 = self.evaluate_function(x0)
            fx1 = self.evaluate_function(x1)
            
            if abs(fx1 - fx0) < 1e-10:
                break
                
            x2 = x1 - fx1 * (x1 - x0) / (fx1 - fx0)
            error = abs(x2 - x1)
            
            steps.append({
                'iteration': i,
                'x0': x0,
                'x1': x1,
                'fx0': fx0,
                'fx1': fx1,
                'x2': x2,
                'error': error
            })
            
            if error < tol:
                break
                
            x0 = x1
            x1 = x2
            
        return steps

    def plot_function(self, steps):
        self.ax.clear()
        
        # Generar puntos para la gráfica
        x_min = min(min(step['x0'] for step in steps), min(step['x1'] for step in steps)) - 1
        x_max = max(max(step['x0'] for step in steps), max(step['x1'] for step in steps)) + 1
        x = np.linspace(x_min, x_max, 100)
        y = [self.evaluate_function(xi) for xi in x]
        
        # Graficar función
        self.ax.plot(x, y, 'b-', label='f(x)')
        
        # Graficar puntos de iteración
        for step in steps:
            self.ax.plot([step['x1']], [step['fx1']], 'ro')
            
        self.ax.grid(True)
        self.ax.legend()
        self.ax.set_xlabel('x')
        self.ax.set_ylabel('f(x)')
        self.canvas.draw()

    def calculate(self):
        try:
            x0 = float(self.x0_var.get())
            x1 = float(self.x1_var.get())
            tol = float(self.tol_var.get())
            max_iter = int(self.max_iter_var.get())
            
            steps = self.secant_method(x0, x1, tol, max_iter)
            
            # Mostrar resultados
            self.result_text.delete(1.0, tk.END)
            self.result_text.insert(tk.END, "Iteración\tx₀\t\tx₁\t\tf(x₀)\t\tf(x₁)\t\tx₂\t\tError\n")
            self.result_text.insert(tk.END, "-" * 100 + "\n")
            
            for step in steps:
                self.result_text.insert(tk.END, 
                    f"{step['iteration']}\t{step['x0']:.6f}\t{step['x1']:.6f}\t{step['fx0']:.6f}\t"
                    f"{step['fx1']:.6f}\t{step['x2']:.6f}\t{step['error']:.6f}\n")
            
            self.plot_function(steps)
            
        except ValueError as e:
            messagebox.showerror("Error", str(e))

if __name__ == "__main__":
    root = tk.Tk()
    app = SecantCalculator(root)
    root.mainloop()