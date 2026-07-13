GoJulley photos — how to add yours
===================================

Drop .jpg files into the folder for their category, named exactly as listed
in that folder's _names.txt. Rules:

  • lowercase, hyphens for spaces, .jpg   (e.g. "Innova Crysta" -> innova-crysta.jpg)
  • every folder MUST keep a default.jpg   (used when nothing else matches)
  • a missing file just shows a gradient tile — never a broken image
  • a name not in the list falls back to default.jpg. Want it matched?
    Tell me the model/place and I add one line to src/photos.ts.

Folders
  bikes/         matched by bike model in the listing title
  cars/          matched by car model in the listing title
  stays/         matched by the stay's location (hotels & homestays)
  places/        matched by trip route / search destination
  services/      matched by service keyword in the title (guide / photographer / mechanic / coordinator)

After adding photos: commit + redeploy (I can do this for you).
