import requests # type: ignore
import json

WEBAPP_URL = "https://script.google.com/macros/s/AKfycbzka9zfxb9UcVz2kVafIWmiYT12YHx0JPb3zPU8jU1PN4BuNzBXeVUe1bMxxqG21b6O0A/exec"  # URL do deploy do Apps Script

pedido = {
    "emailCliente": "teste@cliente.com",
    "empresa": "Minha Empresa",
    "requisitante": "Raul",
    "projeto": "Projeto X",
    "itens": "Item 1, Item 2",
    "quantidade": "10",
    "observacoes": "Sem observações",
    "dataPrevista": "2025-09-15"
}

response = requests.post(
    WEBAPP_URL,
    headers={"Content-Type": "application/json"},
    data=json.dumps(pedido)
)

print(response.text)
