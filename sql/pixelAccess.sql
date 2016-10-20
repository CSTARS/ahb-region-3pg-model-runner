# Create direct pixel access functions
create or replace function public_view.pixelWeather(pixelId integer)
RETURNS table(month integer,tmin float,tmax float,tdmean float,ppt float,rad float,daylight float)
AS $$
BEGIN
RETURN QUERY
with w as (
  select 
    a.month,
    p.pid,
    st_value(a.tmin,p.x,p.y)/100 as tmin,
    st_value(a.tmax,p.x,p.y)/100 as tmax,
    st_value(a.tdmean,p.x,p.y)/100 as tdmean,
    st_value(a.ppt,p.x,p.y)/100 as ppt
  from 
    prism.avg a,
    (select * from afri.pixels as pixel where pixel.pid = pixelId) p
  where 
    a.startyr=1994 and a.stopyr=2009
)
select 
  w.month,
  w.tmin,
  w.tmax,
  w.tdmean,
  w.ppt,
  s.rad,
  s.daylight
from 
  w 
left join 
  public_view.sun s 
  using (pid, month);
END;
$$ LANGUAGE PLPGSQL;
grant EXECUTE on FUNCTION public_view.pixelWeather(integer) TO PUBLIC;

create or replace function public_view.pixelSoil(pixelId integer)
RETURNS table (maxaws float,swpower numeric(6,2),swconst numeric(6,2))
AS $$
BEGIN
RETURN QUERY
select s."maxAWS",s.swpower,s.swconst from public_view.soil s where s.pid = pixelId;
END;
$$ LANGUAGE PLPGSQL;
grant EXECUTE on FUNCTION public_view.pixelSoil(integer) TO PUBLIC;
