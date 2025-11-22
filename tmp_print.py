import pathlib
lines=pathlib.Path('src/App.jsx').read_text().splitlines()
for idx,line in enumerate(lines,1):
