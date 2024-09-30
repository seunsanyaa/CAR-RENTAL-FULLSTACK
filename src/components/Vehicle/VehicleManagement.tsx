'use client'


import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MenuIcon } from "lucide-react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";


const VehicleManagement = () => {


  return (
    <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8 ">
    <div className="grid gap-8 bg-white overflow-hidden">
      <Card>
        <CardHeader>
          <CardTitle>Fleet Management</CardTitle>
          <CardDescription>
            View and manage the vehicles in your fleet, including maintenance and usage details.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Model</TableHead>
                <TableHead>Build</TableHead>
                <TableHead>Kilometers Driven</TableHead>
                <TableHead>Last Oil Check</TableHead>
                <TableHead>Maintenance</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow id="vehicle-1">
                <TableCell className="font-medium">Toyota Corolla</TableCell>
                <TableCell>2020</TableCell>
                <TableCell>45,678 km</TableCell>
                <TableCell>2023-04-15</TableCell>
                <TableCell>
                  <Badge variant="secondary">Due</Badge>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button aria-haspopup="true" size="icon" variant="ghost">
                        <MenuIcon className="h-4 w-4" />
                        <span className="sr-only">Toggle menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                     <Dialog >
                     <DropdownMenuItem onClick={(e) => e.preventDefault()}>
                     <DialogTrigger  >
          Update Vehicle
          </DialogTrigger>
        </DropdownMenuItem>
      <DialogContent className="sm:max-w-[425px] bg-white">
        <DialogHeader>
          <DialogTitle>Update this Vehicle information</DialogTitle>
        </DialogHeader>
        <div>
          <form className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="model">Model</Label>
              <Input id="model" type="text" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="build">Build</Label>
              <Input id="build" type="text" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="kilometers">Kilometers Driven</Label>
              <Input id="kilometers" type="number" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="oil-check">Last Oil Check</Label>
              <Input id="oil-check" type="date" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="maintenance">Maintenance Status</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="due">Due</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </form>
        </div>
        <DialogFooter>
          <div>
            <Button variant="ghost">Cancel</Button>
          </div>
          <Button>Save Vehicle</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    <Dialog >
                     <DropdownMenuItem onClick={(e) => e.preventDefault()}>
                     <DialogTrigger >Delete Vehicle</DialogTrigger></DropdownMenuItem>
                     <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Delete this Vehicle</DialogTitle></DialogHeader><div>Are you sure you want to delete this vehicle?</div> <DialogFooter>
          <div>
            <Button variant="ghost">Cancel</Button>
          </div>
          <Button>Delete Vehicle</Button>
        </DialogFooter></DialogContent></Dialog>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>

              <TableRow id="vehicle-2">
                <TableCell className="font-medium">Toyota Corolla</TableCell>
                <TableCell>2020</TableCell>
                <TableCell>45,678 km</TableCell>
                <TableCell>2023-04-15</TableCell>
                <TableCell>
                  <Badge variant="secondary">Due</Badge>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button aria-haspopup="true" size="icon" variant="ghost">
                        <MenuIcon className="h-4 w-4" />
                        <span className="sr-only">Toggle menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                     <Dialog >
                     <DropdownMenuItem onClick={(e) => e.preventDefault()}>
                     <DialogTrigger  >
          Update Vehicle
          </DialogTrigger>
        </DropdownMenuItem>
      <DialogContent className="sm:max-w-[425px] bg-white">
        <DialogHeader>
          <DialogTitle>Update this Vehicle information</DialogTitle>
        </DialogHeader>
        <div>
          <form className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="model">Model</Label>
              <Input id="model" type="text" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="build">Build</Label>
              <Input id="build" type="text" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="kilometers">Kilometers Driven</Label>
              <Input id="kilometers" type="number" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="oil-check">Last Oil Check</Label>
              <Input id="oil-check" type="date" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="maintenance">Maintenance Status</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="due">Due</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </form>
        </div>
        <DialogFooter>
          <div>
            <Button variant="ghost">Cancel</Button>
          </div>
          <Button>Save Vehicle</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    <Dialog >
                     <DropdownMenuItem onClick={(e) => e.preventDefault()}>
                     <DialogTrigger >Delete Vehicle</DialogTrigger></DropdownMenuItem>
                     <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Delete this Vehicle</DialogTitle></DialogHeader><div>Are you sure you want to delete this vehicle?</div> <DialogFooter>
          <div>
            <Button variant="ghost">Cancel</Button>
          </div>
          <Button>Delete Vehicle</Button>
        </DialogFooter></DialogContent></Dialog>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
    </main>
  );
};

export default VehicleManagement;
