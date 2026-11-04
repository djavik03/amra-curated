from concurrent.futures import ThreadPoolExecutor
from urllib.request import urlretrieve
from pathlib import Path
base=Path('/workspace/sites/amra-curated/dist/assets')
photos={'fragrance':'1615634260167-c8cdede054de','painting':'1579783902614-a3fb3927b6a5','abstract':'1549490349-8643362247b5','watch':'1524592094714-0f0654e20314','watch2':'1523275335684-37898b6baf30','jewellery':'1617038220319-276d3cfab638','earrings':'1535632066927-ab7c9ab60908','perfume2':'1608571423902-eed4a5ad8108','gallery':'1577720643272-265f09367456'}
def get(it):
 name,id=it
 try:
  urlretrieve(f'https://images.unsplash.com/photo-{id}?w=1400&q=85&fit=crop',base/f'{name}.jpg');return name,'ok'
 except Exception as e:return name,str(e)
with ThreadPoolExecutor(max_workers=6) as pool:
 for r in pool.map(get,photos.items()):print(r)
