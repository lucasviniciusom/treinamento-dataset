import os
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import pandas as pd
import numpy as np
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import joblib
import io
import matplotlib.pyplot as plt
import seaborn as sns
import base64
from sklearn.preprocessing import StandardScaler
import json

# Inicializar a aplicação FastAPI
app = FastAPI(
    title="ML Data App API",
    description="API para processamento de dados, EDA e previsões com modelos de machine learning",
    version="1.0.0"
)

# Configurar CORS para permitir requisições do frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Em produção, especificar apenas a origem do frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Diretório para salvar modelos pré-treinados
MODELS_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "models")
os.makedirs(MODELS_DIR, exist_ok=True)

# Variável global para armazenar o DataFrame atual
current_data = None
processed_data = None

# Modelos de dados para as requisições e respostas
class DataPreview(BaseModel):
    columns: List[str]
    data: List[List[Any]]
    shape: List[int]

class PreprocessingOptions(BaseModel):
    drop_columns: List[str] = []
    fill_na_method: str = "mean"  # 'mean', 'median', 'mode', 'drop', 'value'
    fill_na_value: Optional[float] = None
    normalize: bool = True
    remove_outliers: bool = False
    outlier_threshold: float = 1.5  # Para o método IQR

class PredictionRequest(BaseModel):
    model_type: str  # 'regression', 'classification', 'random_forest'
    target_column: str
    feature_columns: List[str]

class PredictionResult(BaseModel):
    predictions: List[float]
    metrics: Dict[str, float]
    model_info: Dict[str, Any]

# Rota para verificar se a API está funcionando
@app.get("/")
async def root():
    return {"message": "ML Data App API está funcionando!"}

# Rota para upload de arquivo CSV
@app.post("/upload-csv/")
async def upload_csv(file: UploadFile = File(...)):
    global current_data
    
    # Verificar se o arquivo é CSV
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Apenas arquivos CSV são aceitos")
    
    # Ler o arquivo CSV
    try:
        contents = await file.read()
        buffer = io.StringIO(contents.decode('utf-8'))
        current_data = pd.read_csv(buffer)
        
        # Preparar preview dos dados
        preview = {
            "columns": current_data.columns.tolist(),
            "data": current_data.head(10).values.tolist(),
            "shape": list(current_data.shape)
        }
        
        return preview
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao processar o arquivo: {str(e)}")

# Rota para obter informações básicas sobre os dados
@app.get("/data-info/")
async def get_data_info():
    global current_data
    
    if current_data is None:
        raise HTTPException(status_code=404, detail="Nenhum dado foi carregado")
    
    # Informações básicas sobre o DataFrame
    info = {
        "shape": current_data.shape,
        "columns": current_data.columns.tolist(),
        "dtypes": {col: str(current_data[col].dtype) for col in current_data.columns},
        "missing_values": current_data.isnull().sum().to_dict(),
        "numeric_columns": current_data.select_dtypes(include=[np.number]).columns.tolist(),
        "categorical_columns": current_data.select_dtypes(include=['object']).columns.tolist()
    }
    
    return info

# Função auxiliar para gerar gráficos como base64
def plot_to_base64(fig):
    buf = io.BytesIO()
    fig.savefig(buf, format='png', bbox_inches='tight')
    buf.seek(0)
    img_str = base64.b64encode(buf.read()).decode('utf-8')
    buf.close()
    plt.close(fig)
    return img_str

# Rota para gerar gráficos EDA
@app.get("/generate-eda/")
async def generate_eda():
    global current_data
    
    if current_data is None:
        raise HTTPException(status_code=404, detail="Nenhum dado foi carregado")
    
    eda_results = {}
    
    # 1. Histogramas para colunas numéricas
    numeric_cols = current_data.select_dtypes(include=[np.number]).columns.tolist()
    if numeric_cols:
        fig, axes = plt.subplots(len(numeric_cols), 1, figsize=(10, 4 * len(numeric_cols)))
        if len(numeric_cols) == 1:
            axes = [axes]
        
        for i, col in enumerate(numeric_cols):
            sns.histplot(current_data[col].dropna(), ax=axes[i])
            axes[i].set_title(f'Distribuição de {col}')
        
        eda_results["histograms"] = plot_to_base64(fig)
    
    # 2. Matriz de correlação
    if len(numeric_cols) > 1:
        fig, ax = plt.subplots(figsize=(10, 8))
        corr_matrix = current_data[numeric_cols].corr()
        sns.heatmap(corr_matrix, annot=True, cmap='coolwarm', ax=ax)
        ax.set_title('Matriz de Correlação')
        
        eda_results["correlation_matrix"] = plot_to_base64(fig)
    
    # 3. Boxplots para detectar outliers
    if numeric_cols:
        fig, axes = plt.subplots(len(numeric_cols), 1, figsize=(10, 4 * len(numeric_cols)))
        if len(numeric_cols) == 1:
            axes = [axes]
        
        for i, col in enumerate(numeric_cols):
            sns.boxplot(x=current_data[col].dropna(), ax=axes[i])
            axes[i].set_title(f'Boxplot de {col}')
        
        eda_results["boxplots"] = plot_to_base64(fig)
    
    return eda_results

# Rota para pré-processar os dados
@app.post("/preprocess/")
async def preprocess_data(options: PreprocessingOptions):
    global current_data, processed_data

    if current_data is None:
        raise HTTPException(status_code=404, detail="Nenhum dado foi carregado")

    try:
        # Criar uma cópia para não modificar os dados originais
        df = current_data.copy()
        preprocessing_steps = []

        # 1. Remover colunas especificadas
        if options.drop_columns:
            df = df.drop(columns=[col for col in options.drop_columns if col in df.columns])
            preprocessing_steps.append(f"Removidas colunas: {', '.join(options.drop_columns)}")

        # 2. Tratar valores ausentes
        na_count_before = df.isnull().sum().sum()

        if options.fill_na_method == "mean":
            for col in df.select_dtypes(include=[np.number]).columns:
                df[col] = df[col].fillna(df[col].mean())
            preprocessing_steps.append("Valores ausentes preenchidos com a média")

        elif options.fill_na_method == "median":
            for col in df.select_dtypes(include=[np.number]).columns:
                df[col] = df[col].fillna(df[col].median())
            preprocessing_steps.append("Valores ausentes preenchidos com a mediana")

        elif options.fill_na_method == "mode":
            for col in df.columns:
                df[col] = df[col].fillna(df[col].mode()[0] if not df[col].mode().empty else None)
            preprocessing_steps.append("Valores ausentes preenchidos com a moda")

        elif options.fill_na_method == "value" and options.fill_na_value is not None:
            df = df.fillna(options.fill_na_value)
            preprocessing_steps.append(f"Valores ausentes preenchidos com {options.fill_na_value}")

        elif options.fill_na_method == "drop":
            df = df.dropna()
            preprocessing_steps.append("Linhas com valores ausentes foram removidas")

        na_count_after = df.isnull().sum().sum()
        preprocessing_steps.append(f"Valores ausentes tratados: {na_count_before - na_count_after}")

        # 3. Remover outliers usando o método IQR
        if options.remove_outliers:
            rows_before = len(df)
            for col in df.select_dtypes(include=[np.number]).columns:
                Q1 = df[col].quantile(0.25)
                Q3 = df[col].quantile(0.75)
                IQR = Q3 - Q1
                lower_bound = Q1 - options.outlier_threshold * IQR
                upper_bound = Q3 + options.outlier_threshold * IQR
                df = df[(df[col] >= lower_bound) & (df[col] <= upper_bound)]
            rows_after = len(df)
            preprocessing_steps.append(f"Outliers removidos: {rows_before - rows_after} linhas")

        # 4. Normalizar dados numéricos
        if options.normalize:
            numeric_cols = df.select_dtypes(include=[np.number]).columns
            if not numeric_cols.empty:
                scaler = StandardScaler()
                df[numeric_cols] = scaler.fit_transform(df[numeric_cols])
                preprocessing_steps.append("Dados numéricos normalizados (StandardScaler)")

        # 5. Criar variáveis-alvo:
        if "close" in df.columns:
            # Classificação: vai subir ou cair?
            df["target_class"] = (df["close"].shift(-1) > df["close"]).astype(int)
            preprocessing_steps.append("Criada coluna 'target_class' (1 = alta, 0 = baixa)")

            # Regressão: valor do próximo close
            df["target_close"] = df["close"].shift(-1)
            preprocessing_steps.append("Criada coluna 'target_close' (valor do próximo close)")

            # Remover últimas linhas com NaN gerado pelo shift
            df = df.dropna(subset=["target_class", "target_close"])

        # Armazenar os dados processados
        processed_data = df

        # Preparar preview dos dados processados
        preview = {
            "columns": df.columns.tolist(),
            "data": df.head(10).values.tolist(),
            "shape": list(df.shape),
            "preprocessing_steps": preprocessing_steps
        }

        return preview

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro no pré-processamento: {str(e)}")


@app.post("/predict/")
async def predict(request: PredictionRequest):
    global processed_data

    if processed_data is None:
        raise HTTPException(status_code=404, detail="Nenhum dado processado disponível")

    try:
        # Se for classification, usa target_class por padrão
        if request.model_type == "classification" and not request.target_column:
            if "target_class" not in processed_data.columns:
                raise HTTPException(status_code=400, detail="Coluna 'target_class' não encontrada. Execute o pré-processamento.")
            request.target_column = "target_class"

        # Se for regression, usa target_close por padrão
        if request.model_type == "regression" and not request.target_column:
            if "target_close" not in processed_data.columns:
                raise HTTPException(status_code=400, detail="Coluna 'target_close' não encontrada. Execute o pré-processamento.")
            request.target_column = "target_close"

        # Validação
        for col in [request.target_column] + request.feature_columns:
            if col not in processed_data.columns:
                raise HTTPException(status_code=400, detail=f"Coluna {col} não encontrada nos dados")

        X = processed_data[request.feature_columns]
        y = processed_data[request.target_column]

        model = None
        model_info = {
            "type": request.model_type,
            "features": request.feature_columns,
            "target": request.target_column
        }

        from sklearn.model_selection import TimeSeriesSplit

        if request.model_type == "regression":
            from sklearn.linear_model import LinearRegression
            from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score

            tscv = TimeSeriesSplit(n_splits=5)
            folds = []
            y_preds = []
            y_tests = []

            for train_idx, test_idx in tscv.split(X):
                X_train, X_test = X.iloc[train_idx], X.iloc[test_idx]
                y_train, y_test = y.iloc[train_idx], y.iloc[test_idx]

                model = LinearRegression()
                model.fit(X_train, y_train)
                y_pred = model.predict(X_test)

                y_preds.extend(y_pred)
                y_tests.extend(y_test)

                mse = mean_squared_error(y_test, y_pred)
                rmse = np.sqrt(mse)
                mae = mean_absolute_error(y_test, y_pred)
                r2 = r2_score(y_test, y_pred)

                folds.append({
                    "mse": mse,
                    "rmse": rmse,
                    "mae": mae,
                    "r2": r2
                })

            metrics = {
                "mse": float(np.mean([f["mse"] for f in folds])),
                "rmse": float(np.mean([f["rmse"] for f in folds])),
                "mae": float(np.mean([f["mae"] for f in folds])),
                "r2": float(np.mean([f["r2"] for f in folds])),
                "folds": folds
            }

            model_info["coefficients"] = {
                feature: float(coef) for feature, coef in zip(request.feature_columns, model.coef_)
            }
            model_info["intercept"] = float(model.intercept_)

        elif request.model_type == "classification":
            from sklearn.linear_model import LogisticRegression
            from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score

            tscv = TimeSeriesSplit(n_splits=5)
            folds = []
            y_preds = []
            y_tests = []

            for train_idx, test_idx in tscv.split(X):
                X_train, X_test = X.iloc[train_idx], X.iloc[test_idx]
                y_train, y_test = y.iloc[train_idx], y.iloc[test_idx]

                model = LogisticRegression(max_iter=1000)
                model.fit(X_train, y_train)
                y_pred = model.predict(X_test)

                y_preds.extend(y_pred)
                y_tests.extend(y_test)

                folds.append({
                    "accuracy": accuracy_score(y_test, y_pred),
                    "precision": precision_score(y_test, y_pred, average='weighted'),
                    "recall": recall_score(y_test, y_pred, average='weighted'),
                    "f1": f1_score(y_test, y_pred, average='weighted')
                })

            metrics = {
                "accuracy": float(np.mean([f["accuracy"] for f in folds])),
                "precision": float(np.mean([f["precision"] for f in folds])),
                "recall": float(np.mean([f["recall"] for f in folds])),
                "f1": float(np.mean([f["f1"] for f in folds])),
                "folds": folds
            }

            model_info["classes"] = model.classes_.tolist()

        elif request.model_type == "random_forest":
            from sklearn.ensemble import RandomForestClassifier
            from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score

            tscv = TimeSeriesSplit(n_splits=5)
            folds = []
            y_preds = []
            y_tests = []

            for train_idx, test_idx in tscv.split(X):
                X_train, X_test = X.iloc[train_idx], X.iloc[test_idx]
                y_train, y_test = y.iloc[train_idx], y.iloc[test_idx]

                model = RandomForestClassifier(n_estimators=100, random_state=42)
                model.fit(X_train, y_train)
                y_pred = model.predict(X_test)

                y_preds.extend(y_pred)
                y_tests.extend(y_test)

                folds.append({
                    "accuracy": accuracy_score(y_test, y_pred),
                    "precision": precision_score(y_test, y_pred, average='weighted'),
                    "recall": recall_score(y_test, y_pred, average='weighted'),
                    "f1": f1_score(y_test, y_pred, average='weighted')
                })

            metrics = {
                "accuracy": float(np.mean([f["accuracy"] for f in folds])),
                "precision": float(np.mean([f["precision"] for f in folds])),
                "recall": float(np.mean([f["recall"] for f in folds])),
                "f1": float(np.mean([f["f1"] for f in folds])),
                "folds": folds
            }

            model_info["feature_importance"] = {
                feature: float(importance) for feature, importance in zip(request.feature_columns, model.feature_importances_)
            }
            model_info["classes"] = model.classes_.tolist()

        else:
            raise HTTPException(status_code=400, detail=f"Tipo de modelo não suportado: {request.model_type}")

        # Salvar modelo
        model_filename = f"{request.model_type}_{pd.Timestamp.now().strftime('%Y%m%d_%H%M%S')}.pkl"
        model_path = os.path.join(MODELS_DIR, model_filename)
        joblib.dump(model, model_path)

        # Previsões para todo o dataset
        all_predictions = model.predict(X)

        # Previsão do próximo candle (última linha dos dados)
        next_prediction = all_predictions[-1]

        return {
            "prediction": float(next_prediction),
            "predictions": all_predictions.tolist(),
            "metrics": metrics,
            "model_info": model_info,
            "model_filename": model_filename
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro na previsão: {str(e)}")

# Rota para obter resultados com previsões para download
@app.get("/download-results/")
async def download_results():
    global processed_data, current_data
    
    if processed_data is None or current_data is None:
        raise HTTPException(status_code=404, detail="Dados não disponíveis para download")
    
    try:
        # Criar um DataFrame com os dados originais e processados
        result_df = current_data.copy()
        
        # Adicionar colunas processadas (se tiverem o mesmo índice)
        if len(processed_data) == len(result_df):
            for col in processed_data.columns:
                if col not in result_df.columns:
                    result_df[f"processed_{col}"] = processed_data[col].values
                elif col in result_df.columns and not processed_data[col].equals(result_df[col]):
                    result_df[f"processed_{col}"] = processed_data[col].values
        
        # Converter para CSV
        csv_content = result_df.to_csv(index=False)
        
        # Retornar o conteúdo CSV como string
        return {"csv_content": csv_content}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao preparar resultados para download: {str(e)}")

# Iniciar o servidor se este arquivo for executado diretamente
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=int(os.environ.get("PORT", 8000)))
